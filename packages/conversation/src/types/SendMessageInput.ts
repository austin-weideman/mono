import type { UIMessage } from "ai";

export interface SendMessageInput {
  conversationId: string;
  role: "user" | "assistant";
  parts: UIMessage["parts"];
}
