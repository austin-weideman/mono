import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";

import type { TurnIdInput } from "../types/TurnIdInput";
import type { TurnSnapshot } from "../types/TurnSnapshot";
import { toTurnSnapshot } from "../utils/messages";
import { requireAccessibleTurn } from "./turnAccess";

export async function getTurn(
  db: DbOrTx,
  actor: Actor,
  input: TurnIdInput,
): Promise<TurnSnapshot> {
  return toTurnSnapshot(await requireAccessibleTurn(db, actor, input.turnId));
}
