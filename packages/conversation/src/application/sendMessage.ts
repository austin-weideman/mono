import type { Db } from "@microlearn/db/client";
import { ForbiddenError, NotFoundError } from "@microlearn/errors";

import type { Message, MessageRole } from "../domain/types";
import { touchConversation } from "../persistence/conversation.mutations";
import { getConversationById } from "../persistence/conversation.queries";
import { insertMessage } from "../persistence/message.mutations";

export interface SendMessageInput {
  conversationId: string;
  userId: string;
  role: MessageRole;
  content: string;
}

export async function sendMessage(
  db: Db,
  input: SendMessageInput,
): Promise<Message> {
  const conversation = await getConversationById(db, input.conversationId);

  if (!conversation) {
    throw new NotFoundError(`Conversation not found: ${input.conversationId}`);
  }

  if (conversation.userId !== input.userId) {
    throw new ForbiddenError("You do not have access to this conversation");
  }

  const message = await insertMessage(db, {
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
  });

  await touchConversation(db, input.conversationId);

  return message;
}
