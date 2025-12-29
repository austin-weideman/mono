import type { Actor } from "@microlearn/core-types";
import { isUserActor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { ForbiddenError, NotFoundError } from "@microlearn/errors";

import { getConversationById } from "../persistence/conversation.queries";
import { archiveConversation } from "../persistence/conversation.mutations";

export interface DeleteConversationInput {
  conversationId: string;
}

export async function deleteConversation(
  db: DbOrTx,
  actor: Actor,
  input: DeleteConversationInput,
): Promise<void> {
  const conversation = await getConversationById(db, input.conversationId);

  if (!conversation) {
    throw new NotFoundError(`Conversation not found: ${input.conversationId}`);
  }

  if (isUserActor(actor) && conversation.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this conversation");
  }

  await archiveConversation(db, input.conversationId);
}

