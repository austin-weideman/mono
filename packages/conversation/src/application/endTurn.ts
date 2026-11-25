import type { DbOrTx } from "@mono/db/client";

import type { TurnEnding } from "../persistence/chat-turn.mutations";
import type { ChatTurn } from "../types/ChatTurn";
import type { ChatTurnStatus } from "../types/ChatTurnStatus";
import { endTurn } from "../persistence/chat-turn.mutations";
import { publishTurnEvent } from "../realtime/turnEvents";

// The one place a turn becomes terminal: the status change, then the `end`
// event every subscriber waits for. Returns null if the turn had already ended.
export async function endTurnAndNotify(
  db: DbOrTx,
  turnId: string,
  from: readonly ChatTurnStatus[],
  ending: TurnEnding,
): Promise<ChatTurn | null> {
  const ended = await endTurn(db, turnId, from, ending);
  if (ended) {
    await publishTurnEvent(turnId, { type: "end", status: ending.status });
  }
  return ended;
}
