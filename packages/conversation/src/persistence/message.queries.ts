import { and, asc, eq, isNull } from "drizzle-orm";

import type { DbOrTx } from "@microlearn/db/client";
import { message } from "@microlearn/db";

import type { Message } from "../types/Message";

export async function listMessagesForConversation(
  db: DbOrTx,
  conversationId: string,
): Promise<Message[]> {
  const messages = await db
    .select()
    .from(message)
    .where(
      and(
        eq(message.conversationId, conversationId),
        isNull(message.archivedAt),
      ),
    )
    .orderBy(asc(message.createdAt));

  return messages as Message[];
}
