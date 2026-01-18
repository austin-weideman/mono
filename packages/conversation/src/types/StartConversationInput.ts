import { z } from "zod";

export const startConversationInputSchema = z.object({
  userId: z.string(),
  title: z.string().nullish(),
  id: z.string().optional(),
});

export type StartConversationInput = z.infer<
  typeof startConversationInputSchema
>;
