import { z } from "zod";

export const pauseScheduledTaskInputSchema = z.object({
  id: z.uuid(),
});

export type PauseScheduledTaskInput = z.infer<
  typeof pauseScheduledTaskInputSchema
>;
