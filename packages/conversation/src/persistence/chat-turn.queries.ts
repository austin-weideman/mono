import { and, asc, desc, eq, inArray, lt } from "drizzle-orm";

import type { DbOrTx } from "@mono/db/client";
import { chatTurn } from "@mono/db";

import type { ChatTurn } from "../types/ChatTurn";
import { ACTIVE_TURN_STATUSES } from "../utils/turnStatus";

export async function getTurnById(
  db: DbOrTx,
  turnId: string,
): Promise<ChatTurn | null> {
  const [turn] = await db
    .select()
    .from(chatTurn)
    .where(eq(chatTurn.id, turnId))
    .limit(1);
  return turn ?? null;
}

export async function getLatestTurnForConversation(
  db: DbOrTx,
  conversationId: string,
): Promise<ChatTurn | null> {
  const [turn] = await db
    .select()
    .from(chatTurn)
    .where(eq(chatTurn.conversationId, conversationId))
    .orderBy(desc(chatTurn.createdAt))
    .limit(1);
  return turn ?? null;
}

export async function getActiveTurnForConversation(
  db: DbOrTx,
  conversationId: string,
): Promise<ChatTurn | null> {
  const [turn] = await db
    .select()
    .from(chatTurn)
    .where(
      and(
        eq(chatTurn.conversationId, conversationId),
        inArray(chatTurn.status, ACTIVE_TURN_STATUSES),
      ),
    )
    .limit(1);
  return turn ?? null;
}

export async function listStreamingTurnsWithHeartbeatBefore(
  db: DbOrTx,
  before: Date,
  limit: number,
): Promise<ChatTurn[]> {
  return await db
    .select()
    .from(chatTurn)
    .where(
      and(eq(chatTurn.status, "streaming"), lt(chatTurn.heartbeatAt, before)),
    )
    .orderBy(asc(chatTurn.heartbeatAt))
    .limit(limit);
}

export async function listQueuedTurnsCreatedBefore(
  db: DbOrTx,
  before: Date,
  limit: number,
): Promise<ChatTurn[]> {
  return await db
    .select()
    .from(chatTurn)
    .where(and(eq(chatTurn.status, "queued"), lt(chatTurn.createdAt, before)))
    .orderBy(asc(chatTurn.createdAt))
    .limit(limit);
}
