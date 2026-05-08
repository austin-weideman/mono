import type { DbOrTx } from "@microlearn/db/client";
import { ScheduledTaskStatus } from "@microlearn/db";

import { upsertPendingScheduledTaskRun } from "../persistence/scheduled-task-run.mutations";
import { updateScheduledTaskById } from "../persistence/scheduled-task.mutations";
import { findDueScheduledTasks } from "../persistence/scheduled-task.queries";
import { computeNextRun } from "../utils/computeNextRun";

export interface DispatchDueResult {
  /** Number of due rows considered in this tick. */
  considered: number;
  /** Number of pending run rows successfully prepared (upserted) for emit. */
  dispatched: number;
  /** Number of schedules marked `completed` because the rrule is exhausted. */
  completed: number;
  /** Number of schedules marked `failed` because computeNextRun threw. */
  failed: number;
}

/**
 * Dispatch step of the scheduler tick — runs in a single DB transaction.
 *
 * For each active schedule whose nextRunAt <= now, atomically:
 *   1. upsert a pending scheduled_task_run row at `scheduledFor = oldNextRunAt`
 *   2. advance scheduled_task.nextRunAt = computeNextRun(rrule, tz, now)
 *      (or mark completed if exhausted)
 *   3. record lastRunId pointing at the new run
 *
 * Per-row try/catch isolates a malformed rrule: that one schedule is marked
 * `failed` and the rest of the batch proceeds.
 *
 * Does NOT call inngest.send — emission lives in `emitPendingRuns`, which
 * runs after this transaction commits. This preserves the transactional
 * outbox pattern: the pending run row IS the outbox.
 */
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
        // computeNextRun threw — deterministic failure, mark the schedule
        // failed so it stops being picked up. The rest of the batch
        // continues. The error is swallowed here because dispatcher tick
        // observability is provided via Inngest function logs and metrics
        // emitted at the call site, not via per-row exceptions.
        await updateScheduledTaskById(tx, row.id, {
          status: ScheduledTaskStatus.FAILED,
        });
        result.failed += 1;
      }
    }

    return result;
  });
}
