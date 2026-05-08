import { z } from "zod";

export const deleteScheduledTaskInputSchema = z.object({
  id: z.uuid(),
});

export type DeleteScheduledTaskInput = z.infer<
  typeof deleteScheduledTaskInputSchema
>;
