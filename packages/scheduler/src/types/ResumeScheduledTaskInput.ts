import { z } from "zod";

export const resumeScheduledTaskInputSchema = z.object({
  id: z.uuid(),
});

export type ResumeScheduledTaskInput = z.infer<
  typeof resumeScheduledTaskInputSchema
>;
