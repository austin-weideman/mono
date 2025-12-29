import type { Actor } from "@microlearn/core-types";
import { isUserActor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { ForbiddenError, NotFoundError } from "@microlearn/errors";

import type { Message } from "../types/Message";
import type { SendMessageInput } from "../types/SendMessageInput";
import { touchConversation } from "../persistence/conversation.mutations";
import { getConversationById } from "../persistence/conversation.queries";
import { insertMessage } from "../persistence/message.mutations";

export async function sendMessage(
  db: DbOrTx,
  actor: Actor,
  input: SendMessageInput,
): Promise<Message> {
  const conversation = await getConversationById(db, input.conversationId);

  if (!conversation) {
    throw new NotFoundError(`Conversation not found: ${input.conversationId}`);
  }

  if (isUserActor(actor) && conversation.userId !== actor.userId) {
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
