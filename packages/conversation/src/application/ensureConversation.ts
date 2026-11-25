import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";

import type { Conversation } from "../types/Conversation";
import type { StartConversationInput } from "../types/StartConversationInput";
import { getConversationById } from "../persistence/conversation.queries";
import { startConversation } from "./startConversation";

// Creates the conversation unless one with this ID already exists, so a
// client-chosen ID can be sent more than once.
export async function ensureConversation(
  db: DbOrTx,
  actor: Actor,
  input: StartConversationInput & { id: string },
): Promise<Conversation> {
  const existing = await getConversationById(db, input.id);
  if (existing) return existing;
  return await startConversation(db, actor, input);
}
