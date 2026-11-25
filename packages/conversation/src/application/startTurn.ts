import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ConflictError, ForbiddenError, NotFoundError } from "@mono/errors";

import type { ChatTurn } from "../types/ChatTurn";
import type { StartTurnInput } from "../types/StartTurnInput";
import { insertTurn } from "../persistence/chat-turn.mutations";
import { getTurnById } from "../persistence/chat-turn.queries";
import { touchConversation } from "../persistence/conversation.mutations";
import { getConversationById } from "../persistence/conversation.queries";
import { insertMessage } from "../persistence/message.mutations";

export interface StartedTurn {
  turn: ChatTurn;
  // False when this turn ID already existed (a repeated request).
  created: boolean;
}

// Saves the user message, an empty assistant message, and a queued turn. Run it
// in a transaction, then dispatch the turn after commit. Rejects with
// ConflictError while another turn in the conversation is active.
export async function startTurn(
  db: DbOrTx,
  actor: Actor,
  input: StartTurnInput,
): Promise<StartedTurn> {
  const conversation = await getConversationById(db, input.conversationId);
  if (!conversation) {
    throw new NotFoundError(`Conversation not found: ${input.conversationId}`);
  }
  if (isUserActor(actor) && conversation.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this conversation");
  }

  const existing = await getTurnById(db, input.turnId);
  if (existing) {
    if (existing.conversationId !== input.conversationId) {
      throw new ConflictError(`Turn ${input.turnId} belongs elsewhere`);
    }
    return { turn: existing, created: false };
  }

  const userMessage = await insertMessage(db, {
    id: input.userMessage.id,
    conversationId: conversation.id,
    role: "user",
    parts: input.userMessage.parts,
  });
  const assistantMessage = await insertMessage(db, {
    conversationId: conversation.id,
    role: "assistant",
    parts: [],
  });
  const turn = await insertTurn(db, {
    id: input.turnId,
    conversationId: conversation.id,
    userId: conversation.userId,
    agent: input.agent,
    gatewayModelId: input.gatewayModelId,
    userMessageId: userMessage.id,
    assistantMessageId: assistantMessage.id,
  });
  await touchConversation(db, conversation.id);

  return { turn, created: true };
}
