import { z } from "zod";

export const updateScheduledTaskInputSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).optional(),
  rrule: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
  dtstart: z.date().optional(),
  payload: z.unknown().optional(),
});

export type UpdateScheduledTaskInput = z.infer<
  typeof updateScheduledTaskInputSchema
>;
