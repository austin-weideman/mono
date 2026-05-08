import { z } from "zod";

export const scheduledTaskRunCursorSchema = z.object({
  id: z.uuid(),
  scheduledFor: z.date(),
});

export type ScheduledTaskRunCursor = z.infer<
  typeof scheduledTaskRunCursorSchema
>;

export const listScheduledTaskRunsInputSchema = z.object({
  scheduledTaskId: z.uuid(),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: scheduledTaskRunCursorSchema.optional(),
});

export type ListScheduledTaskRunsInput = z.infer<
  typeof listScheduledTaskRunsInputSchema
>;
