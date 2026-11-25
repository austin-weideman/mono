import { z } from "zod";

export const turnIdInputSchema = z.object({
  turnId: z.uuid(),
});

export type TurnIdInput = z.infer<typeof turnIdInputSchema>;
