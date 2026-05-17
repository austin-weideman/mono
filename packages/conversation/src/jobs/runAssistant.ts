import type { UIMessage } from "ai";
import type { InngestFunction } from "inngest";
import { convertToModelMessages } from "ai";
import { z } from "zod";

import { createAssistantAgent } from "@mono/agent";
import { recordUsageEvent } from "@mono/billing";
import { systemActor, userActor } from "@mono/core-types";
import { db } from "@mono/db/client";
import { inngest } from "@mono/jobs";
import { conversationRunAssistantEvent } from "@mono/jobs/events/conversation";
import { streamChannel } from "@mono/realtime";

import type { Message } from "../types/Message";
import { loadConversation } from "../application/loadConversation";
import { sendMessage } from "../application/sendMessage";
import { setActiveStream } from "../application/setActiveStream";
import { updateConversationTokenUsage } from "../persistence/conversation.mutations";

const SYSTEM_SERVICE = "conversation";

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

const runAssistantFn = inngest.createFunction(
  {
    id: "conversation-run-assistant",
    retries: 0,
    concurrency: { key: "event.data.conversationId", limit: 1 },
    triggers: [{ event: conversationRunAssistantEvent }],
  },
  async ({ event, step }) => {
    const { conversationId, userId, streamId, gatewayModelId } = event.data;
    const sysActor = systemActor(SYSTEM_SERVICE);
    const usrActor = userActor(userId);
    const channel = streamChannel(streamId);

    await step.run("stream-agent", async () => {
      const { messages: dbMessages } = await loadConversation(db, sysActor, {
        conversationId,
      });

      const { agent, close } = createAssistantAgent({
        gatewayModelId,
        context: { db, actor: usrActor },
        userId,
      });

      const uiMessages = toUIMessages(dbMessages);

      try {
        const result = await agent.stream({
          messages: await convertToModelMessages(uiMessages),
          // Blocks the step boundary while the insert runs. Single row against
          // Neon, and runAssistant is serialized per conversation, so the cost
          // is bounded. Errors are NOT swallowed — a billing-write failure
          // throws and propagates to the outer catch, which emits an error
          // chunk. The user will have already seen any output streamed from
          // earlier steps; subsequent steps are abandoned. This is by design:
          // we'd rather break the chat partway than silently lose spend data.
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
          await channel.emit("ai.chunk", chunk);
        }
      } catch (err) {
        const errorText = err instanceof Error ? err.message : String(err);
        await channel.emit("ai.chunk", { type: "error", errorText });
        throw err;
      } finally {
        try {
          await setActiveStream(db, sysActor, {
            conversationId,
            streamId: null,
          });
        } catch {
          // Conversation may have been archived or deleted mid-stream;
          // swallow so the original error (if any) propagates.
        }
        await close();
      }
    });
  },
);

export const runAssistant: InngestFunction.Any = runAssistantFn;
