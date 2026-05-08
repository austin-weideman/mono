import { z } from "zod";

export const getScheduledTaskInputSchema = z.object({
  id: z.uuid(),
});

export type GetScheduledTaskInput = z.infer<typeof getScheduledTaskInputSchema>;
