import type { DbOrTx } from "@mono/db/client";
import { ScheduledTaskRunStatus } from "@mono/db";

import { updateScheduledTaskRunById } from "../persistence/scheduled-task-run.mutations";

export interface CompleteRunInput {
  runId: string;
  now: Date;
}

export async function completeRun(
  db: DbOrTx,
  input: CompleteRunInput,
): Promise<void> {
  await updateScheduledTaskRunById(db, input.runId, {
    status: ScheduledTaskRunStatus.SUCCEEDED,
    completedAt: input.now,
    error: null,
  });
}

export interface FailRunInput {
  runId: string;
  now: Date;
  error: { name: string; message: string };
}

export async function failRun(db: DbOrTx, input: FailRunInput): Promise<void> {
  await updateScheduledTaskRunById(db, input.runId, {
    status: ScheduledTaskRunStatus.FAILED,
    completedAt: input.now,
    error: input.error,
  });
}
