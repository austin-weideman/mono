import type { InngestFunction } from "inngest";

import { systemActor } from "@microlearn/core-types";
import { db } from "@microlearn/db/client";
import { inngest } from "@microlearn/jobs";
import {
  conversationRunAssistantEvent,
  conversationScheduledStartEvent,
} from "@microlearn/jobs/events/conversation";

import { generateTitleFromText } from "../application/generateTitleFromText";
import { sendMessage } from "../application/sendMessage";
import { setActiveStream } from "../application/setActiveStream";
import { startConversation } from "../application/startConversation";

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

    const { conversationId } = await step.run(
      "create-conversation",
      async () => {
        const title = generateTitleFromText(prompt);
        const conversation = await startConversation(db, sysActor, {
          userId,
          title,
        });
        return { conversationId: conversation.id };
      },
    );

    await step.run("insert-user-message", async () => {
      await sendMessage(db, sysActor, {
        conversationId,
        role: "user",
        parts: [{ type: "text", text: prompt }],
      });
    });

    const { streamId } = await step.run("set-active-stream", async () => {
      const id = crypto.randomUUID();
      await setActiveStream(db, sysActor, {
        conversationId,
        streamId: id,
      });
      return { streamId: id };
    });

    await step.run("trigger-run-assistant", async () => {
      await inngest.send(
        conversationRunAssistantEvent.create(
          { conversationId, userId, streamId, gatewayModelId },
          { id: streamId },
        ),
      );
    });
  },
);

export const startScheduled: InngestFunction.Any = startScheduledFn;
