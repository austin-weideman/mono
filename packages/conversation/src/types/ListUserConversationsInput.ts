import { z } from "zod";

import { conversationCursorSchema } from "./ConversationCursor";

export const listUserConversationsInputSchema = z.object({
  userId: z.string(),
  limit: z.number().min(1).max(100).optional(),
  cursor: conversationCursorSchema.optional(),
});

export type ListUserConversationsInput = z.infer<
  typeof listUserConversationsInputSchema
>;

