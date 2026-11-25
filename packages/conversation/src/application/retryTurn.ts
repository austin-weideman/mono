import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { ConflictError } from "@mono/errors";

import type { RetryTurnInput } from "../types/RetryTurnInput";
import type { StartedTurn } from "./startTurn";
import { insertTurn } from "../persistence/chat-turn.mutations";
import {
  getLatestTurnForConversation,
  getTurnById,
} from "../persistence/chat-turn.queries";
import { touchConversation } from "../persistence/conversation.mutations";
import {
  archiveMessage,
  insertMessage,
} from "../persistence/message.mutations";
import { requireAccessibleTurn } from "./turnAccess";

// Regenerates the reply to the latest turn's user message after that turn
// failed or was stopped. The old reply is archived. Run in a transaction.
export async function retryTurn(
  db: DbOrTx,
  actor: Actor,
  input: RetryTurnInput,
): Promise<StartedTurn> {
  const previous = await requireAccessibleTurn(db, actor, input.retryOfTurnId);

  const existing = await getTurnById(db, input.turnId);
  if (existing) {
    if (existing.conversationId !== previous.conversationId) {
      throw new ConflictError(`Turn ${input.turnId} belongs elsewhere`);
    }
    return { turn: existing, created: false };
  }

  switch (previous.status) {
    case "failed":
    case "cancelled":
      break;
    case "queued":
    case "streaming":
    case "completed":
      throw new ConflictError(`Turn ${previous.id} is ${previous.status}`);
  }

  const latest = await getLatestTurnForConversation(
    db,
    previous.conversationId,
  );
  if (latest?.id !== previous.id) {
    throw new ConflictError("Only the latest reply can be retried");
  }

  await archiveMessage(db, previous.assistantMessageId);
  const assistantMessage = await insertMessage(db, {
    conversationId: previous.conversationId,
    role: "assistant",
    parts: [],
  });
  const turn = await insertTurn(db, {
    id: input.turnId,
    conversationId: previous.conversationId,
    userId: previous.userId,
    agent: previous.agent,
    gatewayModelId: input.gatewayModelId,
    userMessageId: previous.userMessageId,
    assistantMessageId: assistantMessage.id,
  });
  await touchConversation(db, previous.conversationId);

  return { turn, created: true };
}
