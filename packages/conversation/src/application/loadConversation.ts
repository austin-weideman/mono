import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ForbiddenError, NotFoundError } from "@mono/errors";

import type { ConversationWithMessages } from "../types/ConversationWithMessages";
import type { LoadConversationInput } from "../types/LoadConversationInput";
import { getLatestTurnForConversation } from "../persistence/chat-turn.queries";
import { getConversationById } from "../persistence/conversation.queries";
import { listMessagesForConversation } from "../persistence/message.queries";

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
  const latestTurn = await getLatestTurnForConversation(db, conversation.id);

  return {
    conversation,
    messages,
    latestTurn,
  };
}
