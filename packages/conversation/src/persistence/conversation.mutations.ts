import { eq, sql } from "drizzle-orm";

import type { Db } from "@microlearn/db/client";
import { conversation } from "@microlearn/db";
import { InternalServerError } from "@microlearn/errors";

import type { Conversation } from "../domain/types";

export interface InsertConversationInput {
  userId: string;
  title?: string | null;
}

export async function insertConversation(
  db: Db,
  input: InsertConversationInput,
): Promise<Conversation> {
  const [newConversation] = await db
    .insert(conversation)
    .values(input)
    .returning();

  if (!newConversation) {
    throw new InternalServerError("Failed to insert conversation");
  }

  return newConversation;
}

export async function touchConversation(
  db: Db,
  conversationId: string,
): Promise<void> {
  await db
    .update(conversation)
    .set({ updatedAt: sql`NOW()` })
    .where(eq(conversation.id, conversationId));
}

