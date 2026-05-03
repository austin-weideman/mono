import type { Actor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { isUserActor } from "@microlearn/core-types";
import { ForbiddenError, NotFoundError } from "@microlearn/errors";

import { updateActiveStreamId } from "../persistence/conversation.mutations";
import { getConversationById } from "../persistence/conversation.queries";

export interface SetActiveStreamInput {
  conversationId: string;
  streamId: string | null;
}

export async function setActiveStream(
  db: DbOrTx,
  actor: Actor,
  input: SetActiveStreamInput,
): Promise<void> {
  const conversation = await getConversationById(db, input.conversationId);

  if (!conversation) {
    throw new NotFoundError(`Conversation not found: ${input.conversationId}`);
  }

  if (isUserActor(actor) && conversation.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this conversation");
  }

  await updateActiveStreamId(db, input.conversationId, input.streamId);
}
