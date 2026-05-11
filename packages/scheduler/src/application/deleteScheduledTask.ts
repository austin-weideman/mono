import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ForbiddenError, NotFoundError } from "@mono/errors";

import type { DeleteScheduledTaskInput } from "../types/DeleteScheduledTaskInput";
import { archiveScheduledTask } from "../persistence/scheduled-task.mutations";
import { getScheduledTaskById } from "../persistence/scheduled-task.queries";

export async function deleteScheduledTask(
  db: DbOrTx,
  actor: Actor,
  input: DeleteScheduledTaskInput,
): Promise<void> {
  const existing = await getScheduledTaskById(db, input.id);
  if (!existing) {
    throw new NotFoundError(`Scheduled task not found: ${input.id}`);
  }
  if (isUserActor(actor) && existing.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this scheduled task");
  }

  await archiveScheduledTask(db, input.id);
}
