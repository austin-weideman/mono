import type { Actor } from "@microlearn/core-types";
import { isUserActor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { BadRequestError } from "@microlearn/errors";

import type { Conversation } from "../domain/types";
import { insertConversation } from "../persistence/conversation.mutations";

export interface StartConversationInput {
  userId: string;
  title?: string | null;
  id?: string;
}

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

