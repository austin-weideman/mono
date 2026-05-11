import { z } from "zod";

import { scheduledTaskActorTypeSchema } from "@microlearn/db";

export const createScheduledTaskInputSchema = z.object({
  actorType: scheduledTaskActorTypeSchema,
  userId: z.string().nullish(),
  name: z.string().min(1),
  taskType: z.string().min(1),
  payload: z.unknown(),
  rrule: z.string().min(1),
  timezone: z.string().min(1),
  dtstart: z.date().optional(),
});

export type CreateScheduledTaskInput = z.infer<
  typeof createScheduledTaskInputSchema
>;
