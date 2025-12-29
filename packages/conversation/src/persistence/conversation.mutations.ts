import { eq, sql } from "drizzle-orm";

import type { DbOrTx } from "@microlearn/db/client";
import { conversation } from "@microlearn/db";
import { InternalServerError } from "@microlearn/errors";

import type { Conversation } from "../domain/types";

export interface InsertConversationInput {
  userId: string;
  title?: string | null;
  id?: string;
}

export async function insertConversation(
  db: DbOrTx,
  input: InsertConversationInput,
): Promise<Conversation> {
  const [newConversation] = await db
    .insert(conversation)
    .values({
      id: input.id,
      userId: input.userId,
      title: input.title,
    })
    .returning();

  if (!newConversation) {
    throw new InternalServerError("Failed to insert conversation");
  }

  return newConversation;
}

export async function touchConversation(
  db: DbOrTx,
  conversationId: string,
): Promise<void> {
  await db
    .update(conversation)
    .set({ updatedAt: sql`NOW()` })
    .where(eq(conversation.id, conversationId));
}

export async function archiveConversation(
  db: DbOrTx,
  conversationId: string,
): Promise<void> {
  const result = await db
    .update(conversation)
    .set({ archivedAt: sql`NOW()` })
    .where(eq(conversation.id, conversationId))
    .returning({ id: conversation.id });

  if (result.length === 0) {
    throw new InternalServerError(
      `Failed to archive conversation: ${conversationId}`,
    );
  }
}

