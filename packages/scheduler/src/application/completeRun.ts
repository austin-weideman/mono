import type { DbOrTx } from "@microlearn/db/client";
import { ScheduledTaskRunStatus } from "@microlearn/db";

import { updateScheduledTaskRunById } from "../persistence/scheduled-task-run.mutations";

export interface CompleteRunInput {
  runId: string;
  now: Date;
}

/**
 * Executor `step.run('complete')` body — marks the run as succeeded.
 */
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

/**
 * Marks the run as failed. Called by the executor's `onFailure` hook after
 * Inngest has exhausted the retry budget.
 */
export async function failRun(db: DbOrTx, input: FailRunInput): Promise<void> {
  await updateScheduledTaskRunById(db, input.runId, {
    status: ScheduledTaskRunStatus.FAILED,
    completedAt: input.now,
    error: input.error,
  });
}
