import type { FailureEventArgs, InngestFunction, Logger } from "inngest";
import { z } from "zod";

import type {
  conversationAssistantTurnRequestedEvent,
  conversationScientistTurnRequestedEvent,
} from "@mono/jobs/events/conversation";
import { db } from "@mono/db/client";
import { inngest } from "@mono/jobs";

import type { CreateTurnAgent } from "../types/CreateTurnAgent";
import type { TurnStepRunner } from "../types/TurnStepRunner";
import { failTurn } from "../application/failTurn";
import { runChatTurn } from "../application/runChatTurn";

const TURN_RETRIES = 2;
// Hand back to Inngest well before Vercel's 300s limit; each model call then
// starts in a fresh invocation once this much time has passed.
const CHECKPOINT_MAX_RUNTIME = "60s";

const failedTurnDataSchema = z.object({ turnId: z.uuid() });

type TurnRequestedEvent =
  | typeof conversationAssistantTurnRequestedEvent
  | typeof conversationScientistTurnRequestedEvent;

export interface CreateTurnFunctionOptions {
  id: string;
  event: TurnRequestedEvent;
  createAgent: CreateTurnAgent;
}

// Every agent's turn job: same retries, checkpointing, and failure handling.
export function createTurnFunction(
  options: CreateTurnFunctionOptions,
): InngestFunction.Any {
  const turnFunction = inngest.createFunction(
    {
      id: options.id,
      retries: TURN_RETRIES,
      concurrency: { key: "event.data.conversationId", limit: 1 },
      checkpointing: { maxRuntime: CHECKPOINT_MAX_RUNTIME },
      triggers: [{ event: options.event }],
      onFailure: async ({
        event,
        error,
        logger,
      }: FailureEventArgs & { logger: Logger }) => {
        const { turnId } = failedTurnDataSchema.parse(event.data.event.data);
        const failed = await failTurn(db, turnId, "agent_error", error.message);
        logger.error("turn failed", { turnId, error: error.message, failed });
      },
    },
    async ({ event, step, attempt, logger }) => {
      const steps: TurnStepRunner = {
        run: <T>(id: string, fn: () => Promise<T>) =>
          step.run(id, fn) as Promise<T>,
        attempt,
      };
      await runChatTurn(db, {
        turnId: event.data.turnId,
        createAgent: options.createAgent,
        steps,
        logger,
      });
    },
  );
  return turnFunction;
}
