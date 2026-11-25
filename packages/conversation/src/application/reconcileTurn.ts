import type { DbOrTx } from "@mono/db/client";

import type { ChatTurn } from "../types/ChatTurn";
import { dispatchTurn } from "./dispatchTurn";
import { failTurn } from "./failTurn";

export const STALLED_AFTER_MS = 5 * 60_000;
export const REDISPATCH_AFTER_MS = 30_000;
const NEVER_STARTED_AFTER_MS = 10 * 60_000;

export type ReconcileAction =
  | "none"
  | "stalled"
  | "redispatched"
  | "never_started";

// The rules for an active turn whose worker may be gone: a silent worker fails
// the turn, a lost dispatch is re-sent, and a turn that never starts fails.
export async function reconcileTurn(
  db: DbOrTx,
  turn: ChatTurn,
  now: Date,
): Promise<ReconcileAction> {
  const nowMs = now.getTime();
  switch (turn.status) {
    case "streaming": {
      const lastSeen = (turn.heartbeatAt ?? turn.createdAt).getTime();
      if (nowMs - lastSeen < STALLED_AFTER_MS) return "none";
      const failed = await failTurn(
        db,
        turn.id,
        "stalled",
        `No heartbeat since ${new Date(lastSeen).toISOString()}`,
      );
      return failed ? "stalled" : "none";
    }
    case "queued": {
      const age = nowMs - turn.createdAt.getTime();
      if (age >= NEVER_STARTED_AFTER_MS) {
        const failed = await failTurn(
          db,
          turn.id,
          "never_started",
          `Still queued after ${NEVER_STARTED_AFTER_MS / 60_000} minutes`,
        );
        return failed ? "never_started" : "none";
      }
      if (age < REDISPATCH_AFTER_MS) return "none";
      await dispatchTurn(turn);
      return "redispatched";
    }
    case "completed":
    case "failed":
    case "cancelled":
      return "none";
  }
}
