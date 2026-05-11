import type { DbOrTx } from "@mono/db/client";
import { message } from "@mono/db";
import { InternalServerError } from "@mono/errors";

import type { Message } from "../types/Message";
import type { MessageRole } from "../types/MessageRole";

export interface InsertMessageInput {
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
