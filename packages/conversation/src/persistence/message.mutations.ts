import { eq, sql } from "drizzle-orm";

import type { DbOrTx } from "@mono/db/client";
import { message } from "@mono/db";
import { InternalServerError } from "@mono/errors";

import type { Message } from "../types/Message";
import type { MessageRole } from "../types/MessageRole";

export interface InsertMessageInput {
  id?: string;
  conversationId: string;
  role: MessageRole;
  parts: unknown[];
}

export async function insertMessage(
  db: DbOrTx,
  input: InsertMessageInput,
): Promise<Message> {
  const [newMessage] = await db.insert(message).values(input).returning();

  if (!newMessage) {
    throw new InternalServerError("Failed to insert message");
  }

  return newMessage as Message;
}

export async function updateMessageParts(
  db: DbOrTx,
  messageId: string,
  parts: unknown[],
): Promise<void> {
  const result = await db
    .update(message)
    .set({ parts })
    .where(eq(message.id, messageId))
    .returning({ id: message.id });

  if (result.length === 0) {
    throw new InternalServerError(`Failed to update message: ${messageId}`);
  }
}

export async function archiveMessage(
  db: DbOrTx,
  messageId: string,
): Promise<void> {
  await db
    .update(message)
    .set({ archivedAt: sql`NOW()` })
    .where(eq(message.id, messageId));
}
