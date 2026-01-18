import { z } from "zod";

export const conversationCursorSchema = z.object({
  id: z.string(),
  updatedAt: z.iso.datetime(),
});

export type ConversationCursor = z.infer<typeof conversationCursorSchema>;
