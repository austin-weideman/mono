import type { Actor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";
import { systemActor, userActor } from "@microlearn/core-types";
import { ScheduledTaskActorType, ScheduledTaskRunStatus } from "@microlearn/db";
import { InternalServerError, NotFoundError } from "@microlearn/errors";

import type { ScheduledTask } from "../types/ScheduledTask";
import { updateScheduledTaskRunById } from "../persistence/scheduled-task-run.mutations";
import { getScheduledTaskRunById } from "../persistence/scheduled-task-run.queries";
import { getScheduledTaskById } from "../persistence/scheduled-task.queries";

const SCHEDULER_SERVICE = "scheduler";

export interface LoadedRun {
  task: ScheduledTask;
  actor: Actor;
  taskType: string;
  payload: unknown;
  scheduledForIso: string;
}

/**
 * Executor `step.run('load')` body.
 *
 * Loads the run + parent schedule, builds the Actor (USER vs SYSTEM), and
 * transitions the run to `running`. Idempotent on retry: status is set
 * unconditionally; loading the same row twice is fine because the next
 * checkpointed step replays from cache once this step has succeeded once.
 */
export async function loadAndStartRun(
  db: DbOrTx,
  runId: string,
): Promise<LoadedRun> {
  const run = await getScheduledTaskRunById(db, runId);
  if (!run) {
    throw new NotFoundError(`Scheduled task run not found: ${runId}`);
  }

  const task = await getScheduledTaskById(db, run.scheduledTaskId);
  if (!task) {
    // Schedule was archived/deleted after the run was created. The cascade
    // delete on scheduled_task_run.scheduled_task_id should normally remove
    // these, so this is genuinely unexpected.
    throw new NotFoundError(
      `Parent scheduled task not found: ${run.scheduledTaskId}`,
    );
  }

  const actor: Actor =
    task.actorType === ScheduledTaskActorType.USER
      ? task.userId
        ? userActor(task.userId)
        : (() => {
            throw new InternalServerError(
              `USER scheduled task ${task.id} has no userId`,
            );
          })()
      : systemActor(SCHEDULER_SERVICE);

  await updateScheduledTaskRunById(db, runId, {
    status: ScheduledTaskRunStatus.RUNNING,
  });

  return {
    task,
    actor,
    taskType: task.taskType,
    payload: task.payload,
    scheduledForIso: run.scheduledFor.toISOString(),
  };
}
