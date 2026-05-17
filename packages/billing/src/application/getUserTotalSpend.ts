import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ForbiddenError } from "@mono/errors";

import { getUserTotalSpend as readUserTotalSpend } from "../persistence/usageEvent.queries";

export async function getUserTotalSpend(
  db: DbOrTx,
  actor: Actor,
  input: { userId: string },
): Promise<string> {
  if (isUserActor(actor) && actor.userId !== input.userId) {
    throw new ForbiddenError("You can only query your own spend");
  }
  return readUserTotalSpend(db, input);
}
