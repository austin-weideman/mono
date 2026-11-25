import type { DbOrTx } from "@mono/db/client";

import type { TurnLogger } from "../types/TurnLogger";
import type { ReconcileAction } from "./reconcileTurn";
import {
  listQueuedTurnsCreatedBefore,
  listStreamingTurnsWithHeartbeatBefore,
} from "../persistence/chat-turn.queries";
import {
  reconcileTurn,
  REDISPATCH_AFTER_MS,
  STALLED_AFTER_MS,
} from "./reconcileTurn";

const SWEEP_BATCH_SIZE = 100;

export type SweepTurnsResult = Record<Exclude<ReconcileAction, "none">, number>;

// Reconciles every active turn that looks abandoned.
export async function sweepTurns(
  db: DbOrTx,
  now: Date,
  logger: TurnLogger,
): Promise<SweepTurnsResult> {
  const result: SweepTurnsResult = {
    stalled: 0,
    redispatched: 0,
    never_started: 0,
  };

  const candidates = [
    ...(await listStreamingTurnsWithHeartbeatBefore(
      db,
      new Date(now.getTime() - STALLED_AFTER_MS),
      SWEEP_BATCH_SIZE,
    )),
    ...(await listQueuedTurnsCreatedBefore(
      db,
      new Date(now.getTime() - REDISPATCH_AFTER_MS),
      SWEEP_BATCH_SIZE,
    )),
  ];

  for (const turn of candidates) {
    const action = await reconcileTurn(db, turn, now);
    if (action === "none") continue;
    result[action]++;
    logger.warn("turn reconciled", {
      turnId: turn.id,
      conversationId: turn.conversationId,
      action,
    });
  }

  return result;
}
