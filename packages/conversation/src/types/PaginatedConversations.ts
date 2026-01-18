import type { Conversation } from "./Conversation";
import type { ConversationCursor } from "./ConversationCursor";

export interface PaginatedConversations {
  conversations: Conversation[];
  nextCursor: ConversationCursor | null;
}
