import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";

import type { TurnIdInput } from "../types/TurnIdInput";
import { requestTurnCancel } from "../persistence/chat-turn.mutations";
import { endTurnAndNotify } from "./endTurn";
import { requireAccessibleTurn } from "./turnAccess";

// A queued turn ends right away. A streaming turn is flagged; its worker sees
// the flag within a heartbeat, stops the model call, and ends the turn.
export async function cancelTurn(
  db: DbOrTx,
  actor: Actor,
  input: TurnIdInput,
): Promise<void> {
  const turn = await requireAccessibleTurn(db, actor, input.turnId);
  switch (turn.status) {
    case "queued": {
      const ended = await endTurnAndNotify(db, turn.id, ["queued"], {
        status: "cancelled",
      });
      if (!ended) await requestTurnCancel(db, turn.id);
      return;
    }
    case "streaming":
      await requestTurnCancel(db, turn.id);
      return;
    case "completed":
    case "failed":
    case "cancelled":
      return;
  }
}
