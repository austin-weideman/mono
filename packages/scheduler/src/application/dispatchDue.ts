import type { DbOrTx } from "@microlearn/db/client";
import { ScheduledTaskStatus } from "@microlearn/db";

import { upsertPendingScheduledTaskRun } from "../persistence/scheduled-task-run.mutations";
import { updateScheduledTaskById } from "../persistence/scheduled-task.mutations";
import { findDueScheduledTasks } from "../persistence/scheduled-task.queries";
import { computeNextRun } from "../utils/computeNextRun";

export interface DispatchDueResult {
  considered: number;
  dispatched: number;
  completed: number;
  failed: number;
}

export async function dispatchDue(
  db: DbOrTx,
  now: Date,
): Promise<DispatchDueResult> {
  return await db.transaction(async (tx) => {
    const dueRows = await findDueScheduledTasks(tx, now);

    const result: DispatchDueResult = {
      considered: dueRows.length,
      dispatched: 0,
      completed: 0,
      failed: 0,
    };

    for (const row of dueRows) {
      try {
        const next = computeNextRun({
          rrule: row.rrule,
          timezone: row.timezone,
          dtstart: row.dtstart,
          after: now,
        });

        const run = await upsertPendingScheduledTaskRun(tx, {
          scheduledTaskId: row.id,
          scheduledFor: row.nextRunAt,
        });

        await updateScheduledTaskById(tx, row.id, {
          nextRunAt: next ?? row.nextRunAt,
          status: next
            ? ScheduledTaskStatus.ACTIVE
            : ScheduledTaskStatus.COMPLETED,
          lastRunId: run.id,
        });

        result.dispatched += 1;
        if (!next) result.completed += 1;
      } catch {
        // Per-row containment: a malformed rrule is deterministic, so we
        // mark just this schedule failed and let the rest of the batch run.
        await updateScheduledTaskById(tx, row.id, {
          status: ScheduledTaskStatus.FAILED,
        });
        result.failed += 1;
      }
    }

    return result;
  });
}
