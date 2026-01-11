import type { UIMessage } from "ai";

import type { Message } from "@microlearn/conversation";

export function convertDbMessagesToUIMessages(messages: Message[]): UIMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts,
  }));
}

