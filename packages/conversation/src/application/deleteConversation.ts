import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ForbiddenError, NotFoundError } from "@mono/errors";

import type { DeleteConversationInput } from "../types/DeleteConversationInput";
import { archiveConversation } from "../persistence/conversation.mutations";
import { getConversationById } from "../persistence/conversation.queries";

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
