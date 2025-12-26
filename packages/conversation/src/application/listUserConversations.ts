import type { DbOrTx } from "@microlearn/db/client";

import type { Conversation } from "../domain/types";
import { listConversationsForUser } from "../persistence/conversation.queries";

export interface ListUserConversationsInput {
  userId: string;
}

export async function listUserConversations(
  db: DbOrTx,
  input: ListUserConversationsInput,
): Promise<Conversation[]> {
  return await listConversationsForUser(db, input.userId);
}

