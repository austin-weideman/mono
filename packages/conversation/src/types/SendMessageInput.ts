import { z } from "zod";

export const sendMessageInputSchema = z.object({
  conversationId: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export type SendMessageInput = z.infer<typeof sendMessageInputSchema>;

