import type { Actor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { isUserActor } from "@microlearn/core-types";
import { ForbiddenError, NotFoundError } from "@microlearn/errors";

import type { GetScheduledTaskInput } from "../types/GetScheduledTaskInput";
import type { ScheduledTask } from "../types/ScheduledTask";
import { getScheduledTaskById } from "../persistence/scheduled-task.queries";

export async function getScheduledTask(
  db: DbOrTx,
  actor: Actor,
  input: GetScheduledTaskInput,
): Promise<ScheduledTask> {
  const existing = await getScheduledTaskById(db, input.id);
  if (!existing) {
    throw new NotFoundError(`Scheduled task not found: ${input.id}`);
  }
  if (isUserActor(actor) && existing.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this scheduled task");
  }
  return existing;
}
