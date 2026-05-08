import type { Actor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { isUserActor } from "@microlearn/core-types";
import { ForbiddenError, NotFoundError } from "@microlearn/errors";

import type { ListScheduledTaskRunsInput } from "../types/ListScheduledTaskRunsInput";
import type { ScheduledTaskRun } from "../types/ScheduledTaskRun";
import { listScheduledTaskRunsForTask } from "../persistence/scheduled-task-run.queries";
import { getScheduledTaskById } from "../persistence/scheduled-task.queries";

export async function listScheduledTaskRuns(
  db: DbOrTx,
  actor: Actor,
  input: ListScheduledTaskRunsInput,
): Promise<ScheduledTaskRun[]> {
  const task = await getScheduledTaskById(db, input.scheduledTaskId);
  if (!task) {
    throw new NotFoundError(
      `Scheduled task not found: ${input.scheduledTaskId}`,
    );
  }
  if (isUserActor(actor) && task.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this scheduled task");
  }

  return await listScheduledTaskRunsForTask(db, input.scheduledTaskId, {
    limit: input.limit,
    cursor: input.cursor,
  });
}
