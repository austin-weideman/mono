import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import type { Unsubscribe } from "@mono/realtime";

import type { TurnEvent } from "../types/TurnEvent";
import { getTurnById } from "../persistence/chat-turn.queries";
import { subscribeTurnEvents } from "../realtime/turnEvents";
import { asTerminalTurnStatus } from "../utils/turnStatus";
import { reconcileTurn } from "./reconcileTurn";
import { requireAccessibleTurn } from "./turnAccess";

export interface SubscribeToTurnInput {
  turnId: string;
  afterId: string | null;
  // `id` is null only for an `end` synthesized from the database after the
  // event log expired.
  onEvent: (id: string | null, event: TurnEvent) => void;
  onError: (error: Error) => void;
}

// Streams a turn's events after `afterId`, always finishing with `end`. An
// abandoned turn is reconciled first, so a viewer never waits on a dead worker.
export async function subscribeToTurn(
  db: DbOrTx,
  actor: Actor,
  input: SubscribeToTurnInput,
): Promise<Unsubscribe> {
  const turn = await requireAccessibleTurn(db, actor, input.turnId);
  await reconcileTurn(db, turn, new Date());

  const seen = { end: false };
  const unsubscribe = await subscribeTurnEvents(input.turnId, input.afterId, {
    onEvent: (id, event) => {
      if (event.type === "end") seen.end = true;
      input.onEvent(id, event);
    },
    onError: input.onError,
  });

  const current = await getTurnById(db, input.turnId);
  const terminal = current ? asTerminalTurnStatus(current.status) : null;
  if (terminal && !seen.end) {
    input.onEvent(null, { type: "end", status: terminal });
  }

  return unsubscribe;
}
