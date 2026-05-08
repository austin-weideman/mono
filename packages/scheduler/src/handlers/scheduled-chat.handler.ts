import { z } from "zod";

import { isUserActor } from "@microlearn/core-types";
import { ForbiddenError } from "@microlearn/errors";
import { inngest } from "@microlearn/jobs";
import { conversationScheduledStartEvent } from "@microlearn/jobs/events/conversation";

import type { TaskHandler } from "../types/TaskHandler";
import { TaskType } from "../types/TaskType";

export const scheduledChatPayloadSchema = z.object({
  prompt: z.string().min(1),
  gatewayModelId: z.string().min(1),
});

export type ScheduledChatPayload = z.infer<typeof scheduledChatPayloadSchema>;

export const scheduledChatHandler: TaskHandler<ScheduledChatPayload> = {
  taskType: TaskType.SCHEDULED_CHAT,
  payloadSchema: scheduledChatPayloadSchema,
  async execute(ctx, payload) {
    if (!isUserActor(ctx.actor)) {
      throw new ForbiddenError("scheduled_chat requires a USER actor");
    }

    await inngest.send(
      conversationScheduledStartEvent.create(
        {
          userId: ctx.actor.userId,
          prompt: payload.prompt,
          gatewayModelId: payload.gatewayModelId,
        },
        { id: ctx.runId },
      ),
    );
  },
};
