import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ForbiddenError, NotFoundError } from "@mono/errors";

import type { ChatTurn } from "../types/ChatTurn";
import { getTurnById } from "../persistence/chat-turn.queries";

export async function requireAccessibleTurn(
  db: DbOrTx,
  actor: Actor,
  turnId: string,
): Promise<ChatTurn> {
  const turn = await getTurnById(db, turnId);
  if (!turn) {
    throw new NotFoundError(`Turn not found: ${turnId}`);
  }
  if (isUserActor(actor) && turn.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this turn");
  }
  return turn;
}
