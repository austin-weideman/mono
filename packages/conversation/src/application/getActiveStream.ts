import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ForbiddenError, NotFoundError } from "@mono/errors";

import { getConversationById } from "../persistence/conversation.queries";

export interface GetActiveStreamInput {
  conversationId: string;
}

export async function getActiveStream(
  db: DbOrTx,
  actor: Actor,
  input: GetActiveStreamInput,
): Promise<string | null> {
  const conversation = await getConversationById(db, input.conversationId);

  if (!conversation) {
    throw new NotFoundError(`Conversation not found: ${input.conversationId}`);
  }

  if (isUserActor(actor) && conversation.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this conversation");
  }

  return conversation.activeStreamId;
}
