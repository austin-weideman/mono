import type { Actor } from "@microlearn/core-types";
import { isUserActor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { ForbiddenError } from "@microlearn/errors";

import type { ConversationCursor } from "../types/ConversationCursor";
import type { ListUserConversationsInput } from "../types/ListUserConversationsInput";
import type { PaginatedConversations } from "../types/PaginatedConversations";
import { listConversationsForUser } from "../persistence/conversation.queries";

const DEFAULT_PAGE_SIZE = 20;

export async function listUserConversations(
  db: DbOrTx,
  actor: Actor,
  input: ListUserConversationsInput,
): Promise<PaginatedConversations> {
  if (isUserActor(actor) && actor.userId !== input.userId) {
    throw new ForbiddenError("Cannot list conversations for another user");
  }

  const limit = input.limit ?? DEFAULT_PAGE_SIZE;

  const cursorForQuery = input.cursor
    ? {
        id: input.cursor.id,
        updatedAt: new Date(input.cursor.updatedAt),
      }
    : undefined;

  const conversations = await listConversationsForUser(db, input.userId, {
    limit,
    cursor: cursorForQuery,
  });

  const hasMore = conversations.length > limit;
  const resultConversations = hasMore
    ? conversations.slice(0, limit)
    : conversations;

  const lastConversation = resultConversations[resultConversations.length - 1];
  const nextCursor: ConversationCursor | null =
    hasMore && lastConversation
      ? {
          id: lastConversation.id,
          updatedAt: lastConversation.updatedAt.toISOString(),
        }
      : null;

  return {
    conversations: resultConversations,
    nextCursor,
  };
}
