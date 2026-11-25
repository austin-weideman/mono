import type { ToolSet, UIMessage } from "ai";
import { convertToModelMessages, readUIMessageStream, streamText } from "ai";
import { z } from "zod";

import type { DbOrTx } from "@mono/db/client";
import { recordUsageEvent } from "@mono/billing";
import { systemActor } from "@mono/core-types";

import type { CreateTurnAgent } from "../types/CreateTurnAgent";
import type { TurnLogger } from "../types/TurnLogger";
import type { TurnStepOutcome } from "../types/TurnStepOutcome";
import { updateConversationTokenUsage } from "../persistence/conversation.mutations";
import {
  createTurnChunkWriter,
  publishTurnEvent,
} from "../realtime/turnEvents";
import { isClientChunk, messagesForModel } from "../utils/messages";
import { findPendingToolCalls } from "../utils/toolParts";
import { checkTurnStop, loadTurnState, saveTurnProgress } from "./turnState";
import { watchTurn } from "./watchTurn";

const SYSTEM_SERVICE = "conversation";

const gatewayStepMetadataSchema = z.object({
  generationId: z.string().min(1).optional(),
  cost: z.string().min(1).optional(),
});

// The model only proposes tool calls; runToolStep executes each one in its own
// durable step.
function withoutExecute(tools: ToolSet): ToolSet {
  return Object.fromEntries(
    Object.entries(tools).map(([name, tool]) => [
      name,
      { ...tool, execute: undefined },
    ]),
  );
}

function toolsOutcome(
  message: UIMessage,
  index: number,
  maxSteps: number,
): TurnStepOutcome {
  const pending = findPendingToolCalls(message);
  if (pending.length === 0) return { kind: "done" };
  return {
    kind: "tools",
    pendingToolCallIds: pending.map((call) => call.toolCallId),
    stepLimitReached: index + 1 >= maxSteps,
  };
}

export interface RunModelStepInput {
  turnId: string;
  index: number;
  attempt: number;
  createAgent: CreateTurnAgent;
  logger: TurnLogger;
}

// One model call, streamed to the turn's event log and saved to the assistant
// message when it ends.
export async function runModelStep(
  db: DbOrTx,
  input: RunModelStepInput,
): Promise<TurnStepOutcome> {
  const { turnId, index, attempt, createAgent, logger } = input;
  const startedAt = Date.now();

  const stopBefore = await checkTurnStop(db, turnId);
  if (stopBefore) return { kind: "stopped", reason: stopBefore };

  const { turn, messages, assistantMessage } = await loadTurnState(db, turnId);
  const fields = {
    turnId,
    conversationId: turn.conversationId,
    userId: turn.userId,
    agent: turn.agent,
    step: index,
    attempt,
  };

  if (attempt > 0) {
    await publishTurnEvent(turnId, {
      type: "reset",
      message: assistantMessage,
    });
  }

  const agent = await createAgent(turn);
  try {
    if (turn.completedModelSteps > index) {
      return toolsOutcome(assistantMessage, index, agent.maxSteps);
    }

    const modelMessages = await convertToModelMessages(
      messagesForModel(messages),
      { tools: agent.tools, ignoreIncompleteToolCalls: true },
    );

    const abort = new AbortController();
    const watch = watchTurn(db, turnId, logger, () => abort.abort());
    let streamError: unknown = null;

    const result = streamText({
      model: agent.model,
      system: agent.instructions,
      messages: modelMessages,
      tools: withoutExecute(agent.tools),
      providerOptions: agent.providerOptions,
      abortSignal: abort.signal,
      onError: ({ error }) => {
        streamError = error;
      },
      onStepFinish: async ({ providerMetadata }) => {
        const gateway = gatewayStepMetadataSchema.parse(
          providerMetadata?.gateway ?? {},
        );
        if (!gateway.generationId) return;
        await recordUsageEvent(db, systemActor(SYSTEM_SERVICE), {
          userId: turn.userId,
          conversationId: turn.conversationId,
          generationId: gateway.generationId,
          gatewayModelId: turn.gatewayModelId,
          costUsd: gateway.cost ?? null,
        });
      },
    });

    const writer = createTurnChunkWriter(turnId);
    const [clientStream, stateStream] = result
      .toUIMessageStream({
        sendStart: false,
        sendFinish: false,
        sendReasoning: true,
      })
      .tee();

    const forwarding = (async () => {
      for await (const chunk of clientStream) {
        if (isClientChunk(chunk)) writer.write(chunk);
      }
    })();

    let message: UIMessage = assistantMessage;
    try {
      for await (const next of readUIMessageStream({
        message: assistantMessage,
        stream: stateStream,
        onError: () => undefined,
      })) {
        message = next;
      }
      await forwarding;
    } finally {
      watch.dispose();
    }

    const lastEventId = await writer.flush();
    const stopReason = watch.stopReason();
    if (streamError && !stopReason) {
      throw streamError instanceof Error
        ? streamError
        : new Error("Model stream failed", { cause: streamError });
    }

    await saveTurnProgress(db, turn, {
      parts: message.parts,
      lastEventId,
      completedModelSteps: index + 1,
    });

    if (stopReason) {
      logger.info("turn model step stopped", { ...fields, stopReason });
      return { kind: "stopped", reason: stopReason };
    }

    const [usage, finishReason] = await Promise.all([
      result.usage,
      result.finishReason,
    ]);
    await updateConversationTokenUsage(db, {
      conversationId: turn.conversationId,
      lastTotalTokens: usage.totalTokens ?? 0,
    });

    const outcome = toolsOutcome(message, index, agent.maxSteps);
    logger.info("turn model step finished", {
      ...fields,
      finishReason,
      toolCalls:
        outcome.kind === "tools" ? outcome.pendingToolCallIds.length : 0,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      durationMs: Date.now() - startedAt,
    });
    return outcome;
  } finally {
    await agent.close();
  }
}
