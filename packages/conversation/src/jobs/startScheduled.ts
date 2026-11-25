import type { InngestFunction } from "inngest";

import { systemActor } from "@mono/core-types";
import { db } from "@mono/db/client";
import { inngest } from "@mono/jobs";
import { conversationScheduledStartEvent } from "@mono/jobs/events/conversation";

import { dispatchTurn } from "../application/dispatchTurn";
import { ensureConversation } from "../application/ensureConversation";
import { generateTitleFromText } from "../application/generateTitleFromText";
import { startTurn } from "../application/startTurn";

const SYSTEM_SERVICE = "conversation";

const startScheduledFn = inngest.createFunction(
  {
    id: "conversation-scheduled-start",
    retries: 3,
    // Concurrency limit is just on this orchestrator (a few DB writes), not the LLM work. Multiple scheduled runs can still happen in parallel.
    concurrency: { key: "event.data.userId", limit: 1 },
    triggers: [{ event: conversationScheduledStartEvent }],
  },
  async ({ event, step }) => {
    const { userId, prompt, gatewayModelId } = event.data;
    const sysActor = systemActor(SYSTEM_SERVICE);

    const ids = await step.run("generate-ids", () =>
      Promise.resolve({
        conversationId: crypto.randomUUID(),
        turnId: crypto.randomUUID(),
        userMessageId: crypto.randomUUID(),
      }),
    );

    const turn = await step.run("start-turn", async () => {
      return await db.transaction(async (tx) => {
        await ensureConversation(tx, sysActor, {
          id: ids.conversationId,
          userId,
          title: generateTitleFromText(prompt),
        });
        const { turn: started } = await startTurn(tx, sysActor, {
          turnId: ids.turnId,
          conversationId: ids.conversationId,
          agent: "assistant",
          gatewayModelId,
          userMessage: {
            id: ids.userMessageId,
            parts: [{ type: "text", text: prompt }],
          },
        });
        return started;
      });
    });

    await step.run("dispatch-turn", async () => {
      await dispatchTurn(turn);
    });
  },
);

export const startScheduled: InngestFunction.Any = startScheduledFn;
