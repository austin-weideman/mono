import { and, desc, eq, isNull } from "drizzle-orm";

import type { DbOrTx } from "@microlearn/db/client";
import { conversation } from "@microlearn/db";

import type { Conversation } from "../domain/types";

export async function listConversationsForUser(
  db: DbOrTx,
  userId: string,
): Promise<Conversation[]> {
  return await db
    .select()
    .from(conversation)
    .where(
      and(eq(conversation.userId, userId), isNull(conversation.archivedAt)),
    )
    .orderBy(desc(conversation.updatedAt));
}

export async function getConversationById(
  db: DbOrTx,
  conversationId: string,
): Promise<Conversation | null> {
  const [result] = await db
    .select()
    .from(conversation)
    .where(
      and(
        eq(conversation.id, conversationId),
        isNull(conversation.archivedAt),
      ),
    )
    .limit(1);

  return result ?? null;
}

