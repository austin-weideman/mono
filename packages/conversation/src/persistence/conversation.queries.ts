import { and, desc, eq, isNull, lt, or } from "drizzle-orm";

import type { DbOrTx } from "@microlearn/db/client";
import { conversation } from "@microlearn/db";

import type { Conversation } from "../types/Conversation";

export interface ListConversationsOptions {
  limit: number;
  cursor?: {
    id: string;
    updatedAt: Date;
  };
}

export async function listConversationsForUser(
  db: DbOrTx,
  userId: string,
  options: ListConversationsOptions,
): Promise<Conversation[]> {
  const { limit, cursor } = options;

  return await db
    .select()
    .from(conversation)
    .where(
      and(
        eq(conversation.userId, userId),
        isNull(conversation.archivedAt),
        cursor
          ? or(
              lt(conversation.updatedAt, cursor.updatedAt),
              and(
                eq(conversation.updatedAt, cursor.updatedAt),
                lt(conversation.id, cursor.id),
              ),
            )
          : undefined,
      ),
    )
    .orderBy(desc(conversation.updatedAt), desc(conversation.id))
    .limit(limit + 1);
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

