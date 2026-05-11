import { z } from "zod";

import { isUserActor } from "@mono/core-types";
import { ForbiddenError } from "@mono/errors";
import { inngest } from "@mono/jobs";
import { conversationScheduledStartEvent } from "@mono/jobs/events/conversation";

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
