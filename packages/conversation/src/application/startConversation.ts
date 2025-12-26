import type { DbOrTx } from "@microlearn/db/client";

import type { Conversation } from "../domain/types";
import { insertConversation } from "../persistence/conversation.mutations";

export interface StartConversationInput {
  userId: string;
  title?: string | null;
  id?: string;
}

export async function startConversation(
  db: DbOrTx,
  input: StartConversationInput,
): Promise<Conversation> {
  return await insertConversation(db, {
    id: input.id,
    userId: input.userId,
    title: input.title,
  });
}

