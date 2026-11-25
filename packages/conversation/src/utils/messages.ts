import type { UIMessage, UIMessageChunk } from "ai";

import type { ChatTurn } from "../types/ChatTurn";
import type { Message } from "../types/Message";
import type { TurnSnapshot } from "../types/TurnSnapshot";

export function toUIMessage(message: Message): UIMessage {
  return { id: message.id, role: message.role, parts: message.parts };
}

// Assistant messages of turns that failed before producing anything stay empty;
// providers reject empty messages, so they are left out of the model's history.
export function messagesForModel(messages: UIMessage[]): UIMessage[] {
  return messages.filter((message) => message.parts.length > 0);
}

// Errors and aborts reach clients as turn events, not as message chunks.
export function isClientChunk(chunk: UIMessageChunk): boolean {
  return chunk.type !== "error" && chunk.type !== "abort";
}

export function toTurnSnapshot(turn: ChatTurn): TurnSnapshot {
  return {
    id: turn.id,
    status: turn.status,
    assistantMessageId: turn.assistantMessageId,
    persistedEventId: turn.persistedEventId,
  };
}
