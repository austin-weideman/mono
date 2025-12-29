import type { DbOrTx } from "@microlearn/db/client";
import { message } from "@microlearn/db";
import { InternalServerError } from "@microlearn/errors";

import type { Message } from "../types/Message";
import type { MessageRole } from "../types/MessageRole";

export interface InsertMessageInput {
  conversationId: string;
  role: MessageRole;
  content: string;
}

export async function insertMessage(
  db: DbOrTx,
  input: InsertMessageInput,
): Promise<Message> {
  const [newMessage] = await db.insert(message).values(input).returning();

  if (!newMessage) {
    throw new InternalServerError("Failed to insert message");
  }

  return newMessage;
}

