import type { Conversation } from "./Conversation";
import type { Message } from "./Message";

export interface ConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
}

