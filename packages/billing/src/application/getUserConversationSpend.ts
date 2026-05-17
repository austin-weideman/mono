import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ForbiddenError } from "@mono/errors";

import { getUserConversationSpend as readUserConversationSpend } from "../persistence/usageEvent.queries";

export async function getUserConversationSpend(
  db: DbOrTx,
  actor: Actor,
  input: { userId: string; conversationId: string },
): Promise<string> {
  if (isUserActor(actor) && actor.userId !== input.userId) {
    throw new ForbiddenError("You can only query your own spend");
  }
  return readUserConversationSpend(db, input);
}
