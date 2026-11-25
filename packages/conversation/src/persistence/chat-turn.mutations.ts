import { and, eq, inArray, sql } from "drizzle-orm";

import type { NewChatTurn } from "@mono/db";
import type { DbOrTx } from "@mono/db/client";
import { chatTurn } from "@mono/db";
import { ConflictError, InternalServerError } from "@mono/errors";

import type { ChatTurn } from "../types/ChatTurn";
import type { ChatTurnFailureKind } from "../types/ChatTurnFailureKind";
import type { ChatTurnStatus } from "../types/ChatTurnStatus";
import { ACTIVE_TURN_STATUSES } from "../utils/turnStatus";

const UNIQUE_VIOLATION = "23505";
const ACTIVE_TURN_INDEX = "uniq_chat_turn_active_per_conversation";

function isActiveTurnConflict(error: unknown): boolean {
  const cause = error instanceof Error ? (error.cause ?? error) : error;
  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    cause.code === UNIQUE_VIOLATION &&
    "constraint" in cause &&
    cause.constraint === ACTIVE_TURN_INDEX
  );
}

export async function insertTurn(
  db: DbOrTx,
  input: Omit<NewChatTurn, "status">,
): Promise<ChatTurn> {
  try {
    const [turn] = await db
      .insert(chatTurn)
      .values({ ...input, status: "queued" })
      .returning();
    if (!turn) throw new InternalServerError("Failed to insert chat turn");
    return turn;
  } catch (error) {
    if (isActiveTurnConflict(error)) {
      throw new ConflictError("A reply is already in progress", {
        details: { conversationId: input.conversationId },
      });
    }
    throw error;
  }
}

export async function markTurnStreaming(
  db: DbOrTx,
  turnId: string,
): Promise<ChatTurn | null> {
  const [turn] = await db
    .update(chatTurn)
    .set({
      status: "streaming",
      startedAt: sql`NOW()`,
      heartbeatAt: sql`NOW()`,
    })
    .where(and(eq(chatTurn.id, turnId), eq(chatTurn.status, "queued")))
    .returning();
  return turn ?? null;
}

export interface TurnHeartbeat {
  status: ChatTurnStatus;
  cancelRequested: boolean;
}

export async function recordTurnHeartbeat(
  db: DbOrTx,
  turnId: string,
): Promise<TurnHeartbeat | null> {
  const [row] = await db
    .update(chatTurn)
    .set({ heartbeatAt: sql`NOW()` })
    .where(and(eq(chatTurn.id, turnId), eq(chatTurn.status, "streaming")))
    .returning({
      status: chatTurn.status,
      cancelRequestedAt: chatTurn.cancelRequestedAt,
    });
  return row
    ? { status: row.status, cancelRequested: row.cancelRequestedAt !== null }
    : null;
}

export interface TurnProgressUpdate {
  persistedEventId: string | null;
  completedModelSteps: number;
}

export async function updateTurnProgress(
  db: DbOrTx,
  turnId: string,
  update: TurnProgressUpdate,
): Promise<void> {
  await db.update(chatTurn).set(update).where(eq(chatTurn.id, turnId));
}

export async function requestTurnCancel(
  db: DbOrTx,
  turnId: string,
): Promise<void> {
  await db
    .update(chatTurn)
    .set({
      cancelRequestedAt: sql`COALESCE(${chatTurn.cancelRequestedAt}, NOW())`,
    })
    .where(
      and(
        eq(chatTurn.id, turnId),
        inArray(chatTurn.status, ACTIVE_TURN_STATUSES),
      ),
    );
}

export type TurnEnding =
  | { status: "completed" }
  | { status: "cancelled" }
  | {
      status: "failed";
      failureKind: ChatTurnFailureKind;
      failureReason: string;
    };

// Moves an active turn to a terminal status. Returns null when the turn was
// not in one of `from` (someone else already ended it).
export async function endTurn(
  db: DbOrTx,
  turnId: string,
  from: readonly ChatTurnStatus[],
  ending: TurnEnding,
): Promise<ChatTurn | null> {
  const failure =
    ending.status === "failed"
      ? { failureKind: ending.failureKind, failureReason: ending.failureReason }
      : {};
  const [turn] = await db
    .update(chatTurn)
    .set({ status: ending.status, finishedAt: sql`NOW()`, ...failure })
    .where(and(eq(chatTurn.id, turnId), inArray(chatTurn.status, [...from])))
    .returning();
  return turn ?? null;
}
