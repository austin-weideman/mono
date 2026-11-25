import type { DbOrTx } from "@mono/db/client";

import type { TurnLogger } from "../types/TurnLogger";
import type { TurnStopReason } from "../types/TurnStepOutcome";
import { checkTurnStop } from "./turnState";

const HEARTBEAT_INTERVAL_MS = 2_000;

export interface TurnWatch {
  stopReason: () => TurnStopReason | null;
  dispose: () => void;
}

// Heartbeats while a step runs and calls `onStop` once the turn is cancelled or
// ended elsewhere.
export function watchTurn(
  db: DbOrTx,
  turnId: string,
  logger: TurnLogger,
  onStop: () => void,
): TurnWatch {
  let reason: TurnStopReason | null = null;
  let checking = false;

  const interval = setInterval(() => {
    if (checking || reason) return;
    checking = true;
    void checkTurnStop(db, turnId)
      .then((stop) => {
        if (!stop) return;
        reason = stop;
        onStop();
      })
      .catch((error: unknown) => {
        logger.warn("turn heartbeat failed", {
          turnId,
          error: error instanceof Error ? error.message : String(error),
        });
      })
      .finally(() => {
        checking = false;
      });
  }, HEARTBEAT_INTERVAL_MS);

  return {
    stopReason: () => reason,
    dispose: () => clearInterval(interval),
  };
}
