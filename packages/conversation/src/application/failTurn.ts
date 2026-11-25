import type { DbOrTx } from "@mono/db/client";

import type { ChatTurnFailureKind } from "../types/ChatTurnFailureKind";
import { ACTIVE_TURN_STATUSES } from "../utils/turnStatus";
import { endTurnAndNotify } from "./endTurn";

export async function failTurn(
  db: DbOrTx,
  turnId: string,
  failureKind: ChatTurnFailureKind,
  failureReason: string,
): Promise<boolean> {
  const ended = await endTurnAndNotify(db, turnId, ACTIVE_TURN_STATUSES, {
    status: "failed",
    failureKind,
    failureReason,
  });
  return ended !== null;
}
