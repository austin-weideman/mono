import type { Actor } from "@microlearn/core-types";
import { isUserActor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { ForbiddenError, NotFoundError } from "@microlearn/errors";

import type { ConversationWithMessages } from "../domain/types";
import { getConversationById } from "../persistence/conversation.queries";
import { listMessagesForConversation } from "../persistence/message.queries";

export interface LoadConversationInput {
  conversationId: string;
}

export async function loadConversation(
  db: DbOrTx,
  actor: Actor,
  input: LoadConversationInput,
): Promise<ConversationWithMessages> {
  const conversation = await getConversationById(db, input.conversationId);

  if (!conversation) {
    throw new NotFoundError(`Conversation not found: ${input.conversationId}`);
  }

  if (isUserActor(actor) && conversation.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this conversation");
  }

  const messages = await listMessagesForConversation(db, conversation.id);

  return {
    conversation,
    messages,
  };
}
