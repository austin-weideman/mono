import type { Actor } from "@microlearn/core-types";
import { isUserActor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { BadRequestError } from "@microlearn/errors";

import type { Conversation } from "../domain/types";
import { listConversationsForUser } from "../persistence/conversation.queries";

export interface ListUserConversationsInput {
  userId: string;
}

export async function listUserConversations(
  db: DbOrTx,
  actor: Actor,
  input: ListUserConversationsInput,
): Promise<Conversation[]> {
  if (isUserActor(actor) && actor.userId !== input.userId) {
    throw new BadRequestError("Cannot list conversations for another user");
  }

  return await listConversationsForUser(db, input.userId);
}

