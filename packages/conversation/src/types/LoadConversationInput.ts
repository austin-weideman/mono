import { z } from "zod";

export const loadConversationInputSchema = z.object({
  conversationId: z.string(),
});

export type LoadConversationInput = z.infer<typeof loadConversationInputSchema>;

