import type { Actor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { isUserActor } from "@microlearn/core-types";
import { ForbiddenError, NotFoundError } from "@microlearn/errors";

import type { PauseScheduledTaskInput } from "../types/PauseScheduledTaskInput";
import type { ScheduledTask } from "../types/ScheduledTask";
import { updateScheduledTaskById } from "../persistence/scheduled-task.mutations";
import { getScheduledTaskById } from "../persistence/scheduled-task.queries";

export async function pauseScheduledTask(
  db: DbOrTx,
  actor: Actor,
  input: PauseScheduledTaskInput,
): Promise<ScheduledTask> {
  const existing = await getScheduledTaskById(db, input.id);
  if (!existing) {
    throw new NotFoundError(`Scheduled task not found: ${input.id}`);
  }
  if (isUserActor(actor) && existing.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this scheduled task");
  }

  return await updateScheduledTaskById(db, input.id, { status: "paused" });
}
