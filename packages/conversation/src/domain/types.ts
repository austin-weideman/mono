import type {
  Conversation as DbConversation,
  Message as DbMessage,
  MessageRole,
} from "@microlearn/db";

export type Conversation = DbConversation;
export type Message = DbMessage;

export type { MessageRole };

export interface ConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
}
