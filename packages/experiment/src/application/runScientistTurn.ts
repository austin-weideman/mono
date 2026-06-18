import type { UIMessage, UIMessageChunk } from "ai";
import { convertToModelMessages } from "ai";
import { z } from "zod";

import type { Message } from "@mono/conversation";
import type { DbOrTx } from "@mono/db/client";
import { recordUsageEvent } from "@mono/billing";
import {
  loadConversation,
  sendMessage,
  updateConversationTokenUsage,
} from "@mono/conversation";
import { systemActor, userActor } from "@mono/core-types";
import { NotFoundError } from "@mono/errors";

import { createScientistAgent } from "../agent/scientist";
import { getCampaignById } from "../persistence/campaign.queries";

const SYSTEM_SERVICE = "experiment";

// Same shape runAssistant validates: the AI Gateway reports generationId + cost
// in provider metadata.
const gatewayStepMetadataSchema = z.object({
  generationId: z.string().min(1).optional(),
  cost: z.string().min(1).optional(),
});

function toUIMessages(messages: Message[]): UIMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts,
  }));
}

export interface RunScientistTurnInput {
  campaignId: string;
  userId: string;
  gatewayModelId: string;
  // Optional sink for streamed UI chunks. The Inngest job forwards these to the
  // realtime channel; the headless study omits it and the turn runs silently.
  onChunk?: (chunk: UIMessageChunk) => Promise<void> | void;
}

// Runs ONE scientist turn to completion: loads the campaign's conversation,
// streams the agent (which calls run_experiment inline), persists the assistant
// message, and records usage. Mirrors runAssistant's inner logic so the realtime
// pipeline, resume, and cost tracking are inherited. Reused verbatim by the
// headless study (no channel) and the Inngest job (with a channel).
export async function runScientistTurn(
  db: DbOrTx,
  input: RunScientistTurnInput,
): Promise<void> {
  const { campaignId, userId, gatewayModelId, onChunk } = input;
  const sysActor = systemActor(SYSTEM_SERVICE);
  const usrActor = userActor(userId);

  const campaign = await getCampaignById(db, campaignId);
  if (!campaign) {
    throw new NotFoundError(`Campaign not found: ${campaignId}`);
  }
  const conversationId = campaign.conversationId;

  const { messages: dbMessages } = await loadConversation(db, sysActor, {
    conversationId,
  });

  const { agent, close } = createScientistAgent({
    gatewayModelId,
    campaign,
    context: { db, actor: usrActor },
    userId,
  });

  const uiMessages = toUIMessages(dbMessages);

  try {
    const result = await agent.stream({
      messages: await convertToModelMessages(uiMessages),
      onStepFinish: async ({ providerMetadata }) => {
        const gw = gatewayStepMetadataSchema.parse(
          providerMetadata?.gateway ?? {},
        );
        if (!gw.generationId) return;

        await recordUsageEvent(db, sysActor, {
          userId,
          conversationId,
          generationId: gw.generationId,
          gatewayModelId,
          costUsd: gw.cost ?? null,
        });
      },
    });

    const stream = result.toUIMessageStream({
      generateMessageId: () => crypto.randomUUID(),
      sendReasoning: true,
      onFinish: async ({ messages, isAborted }) => {
        if (isAborted) return;
        const last = messages[messages.length - 1];
        if (last?.role === "assistant") {
          await sendMessage(db, sysActor, {
            conversationId,
            role: "assistant",
            parts: last.parts,
          });

          const usage = await result.usage;
          await updateConversationTokenUsage(db, {
            conversationId,
            lastTotalTokens: usage.totalTokens ?? 0,
          });
        }
      },
    });

    for await (const chunk of stream) {
      if (onChunk) await onChunk(chunk);
    }
  } finally {
    await close();
  }
}
