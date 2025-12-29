import { z } from "zod";

export const deleteConversationInputSchema = z.object({
  conversationId: z.string(),
});

export type DeleteConversationInput = z.infer<
  typeof deleteConversationInputSchema
>;

