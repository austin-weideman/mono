import type { UIMessage } from "ai";

import type { DbOrTx } from "@mono/db/client";
import { InternalServerError, NotFoundError } from "@mono/errors";

import type { ChatTurn } from "../types/ChatTurn";
import type { TurnStopReason } from "../types/TurnStepOutcome";
import {
  recordTurnHeartbeat,
  updateTurnProgress,
} from "../persistence/chat-turn.mutations";
import { getTurnById } from "../persistence/chat-turn.queries";
import { updateMessageParts } from "../persistence/message.mutations";
import { listMessagesForConversation } from "../persistence/message.queries";
import { toUIMessage } from "../utils/messages";

export interface TurnState {
  turn: ChatTurn;
  messages: UIMessage[];
  assistantMessage: UIMessage;
}

export async function loadTurnState(
  db: DbOrTx,
  turnId: string,
): Promise<TurnState> {
  const turn = await getTurnById(db, turnId);
  if (!turn) throw new NotFoundError(`Turn not found: ${turnId}`);

  const messages = (
    await listMessagesForConversation(db, turn.conversationId)
  ).map(toUIMessage);
  const assistantMessage = messages.find(
    (message) => message.id === turn.assistantMessageId,
  );
  if (!assistantMessage) {
    throw new InternalServerError(
      `Assistant message ${turn.assistantMessageId} missing for turn ${turnId}`,
    );
  }
  return { turn, messages, assistantMessage };
}

// Heartbeats the turn and reports why it must stop, or null to keep going.
export async function checkTurnStop(
  db: DbOrTx,
  turnId: string,
): Promise<TurnStopReason | null> {
  const heartbeat = await recordTurnHeartbeat(db, turnId);
  if (!heartbeat) return "gone";
  return heartbeat.cancelRequested ? "cancelled" : null;
}

export interface TurnProgress {
  parts: UIMessage["parts"];
  lastEventId: string | null;
  completedModelSteps: number;
}

export async function saveTurnProgress(
  db: DbOrTx,
  turn: ChatTurn,
  progress: TurnProgress,
): Promise<void> {
  await db.transaction(async (tx) => {
    await updateMessageParts(tx, turn.assistantMessageId, progress.parts);
    await updateTurnProgress(tx, turn.id, {
      persistedEventId: progress.lastEventId ?? turn.persistedEventId,
      completedModelSteps: progress.completedModelSteps,
    });
  });
}
