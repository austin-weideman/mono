import type { DbOrTx } from "@mono/db/client";

import { markTurnStreaming } from "../persistence/chat-turn.mutations";
import { getTurnById } from "../persistence/chat-turn.queries";
import { publishTurnEvent } from "../realtime/turnEvents";

// Claims a queued turn for this worker. False when the turn already ended
// (cancelled while queued, or failed by the sweeper).
export async function beginTurn(db: DbOrTx, turnId: string): Promise<boolean> {
  const turn =
    (await markTurnStreaming(db, turnId)) ?? (await getTurnById(db, turnId));
  if (turn?.status !== "streaming") return false;

  await publishTurnEvent(turnId, {
    type: "chunks",
    chunks: [{ type: "start", messageId: turn.assistantMessageId }],
  });
  return true;
}
