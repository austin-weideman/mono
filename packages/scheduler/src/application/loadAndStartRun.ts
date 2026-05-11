import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { systemActor, userActor } from "@mono/core-types";
import { ScheduledTaskActorType, ScheduledTaskRunStatus } from "@mono/db";
import { InternalServerError, NotFoundError } from "@mono/errors";

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
    throw new NotFoundError(
      `Parent scheduled task not found: ${run.scheduledTaskId}`,
    );
  }

  let actor: Actor;
  if (task.actorType === ScheduledTaskActorType.USER) {
    if (!task.userId) {
      throw new InternalServerError(
        `USER scheduled task ${task.id} has no userId`,
      );
    }
    actor = userActor(task.userId);
  } else {
    actor = systemActor(SCHEDULER_SERVICE);
  }

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
