import { and, asc, eq, isNull } from "drizzle-orm";

import type { Db } from "@microlearn/db/client";
import { message } from "@microlearn/db";

import type { Message } from "../domain/types";

export async function listMessagesForConversation(
  db: Db,
  conversationId: string,
): Promise<Message[]> {
  return await db
    .select()
    .from(message)
    .where(
      and(
        eq(message.conversationId, conversationId),
        isNull(message.archivedAt),
      ),
    )
    .orderBy(asc(message.createdAt));
}

