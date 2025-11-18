import type { Db } from "@microlearn/db/client";

import type { Conversation } from "../domain/types";
import { insertConversation } from "../persistence/conversation.mutations";

export interface StartConversationInput {
  userId: string;
  title?: string | null;
}

export async function startConversation(
  db: Db,
  input: StartConversationInput,
): Promise<Conversation> {
  return await insertConversation(db, {
    userId: input.userId,
    title: input.title,
  });
}

