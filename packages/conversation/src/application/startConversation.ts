import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { BadRequestError } from "@mono/errors";

import type { Conversation } from "../types/Conversation";
import type { StartConversationInput } from "../types/StartConversationInput";
import { insertConversation } from "../persistence/conversation.mutations";

export async function startConversation(
  db: DbOrTx,
  actor: Actor,
  input: StartConversationInput,
): Promise<Conversation> {
  if (isUserActor(actor) && actor.userId !== input.userId) {
    throw new BadRequestError("Cannot start a conversation for another user");
  }

  return await insertConversation(db, {
    id: input.id,
    userId: input.userId,
    title: input.title,
  });
}
