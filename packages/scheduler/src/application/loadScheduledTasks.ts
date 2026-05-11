import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ForbiddenError } from "@mono/errors";

import type { ScheduledTask } from "../types/ScheduledTask";
import { loadScheduledTasksForUser } from "../persistence/scheduled-task.queries";

export async function loadScheduledTasks(
  db: DbOrTx,
  actor: Actor,
): Promise<ScheduledTask[]> {
  if (!isUserActor(actor)) {
    throw new ForbiddenError(
      "loadScheduledTasks requires a USER actor (use persistence directly for SYSTEM queries)",
    );
  }
  return await loadScheduledTasksForUser(db, actor.userId);
}
