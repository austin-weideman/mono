import type { Inngest } from "inngest";

import type { DbOrTx } from "@microlearn/db/client";
import { scheduledTaskDueEvent } from "@microlearn/jobs/events/scheduler";

import { updateScheduledTaskRunById } from "../persistence/scheduled-task-run.mutations";
import { findPendingEmitRuns } from "../persistence/scheduled-task-run.queries";

/**
 * Narrow shape of the Inngest client surface this function depends on, so
 * tests can pass a fake `{ send: vi.fn() }` without standing up Inngest.
 */
export type InngestSender = Pick<Inngest.Any, "send">;

export interface EmitPendingRunsResult {
  considered: number;
  emitted: number;
  failed: number;
}

/**
 * Emit step of the scheduler tick.
 *
 * Runs AFTER the dispatch transaction commits (and outside any DB
 * transaction). Calling inngest.send() inside BEGIN/COMMIT would
 * re-introduce the dual-write hazard the outbox pattern exists to prevent.
 *
 * Selects pending run rows where `inngestEventId IS NULL` (locks them with
 * SKIP LOCKED so concurrent emitters partition cleanly), composes a stable
 * event id `${scheduledTaskId}:${scheduledFor.toISOString()}` for
 * idempotency at Inngest's side, sends the event, then marks the row with
 * the event id. A send failure leaves the row pending so the next tick
 * re-attempts it.
 */
export async function emitPendingRuns(
  db: DbOrTx,
  inngest: InngestSender,
  _now: Date,
): Promise<EmitPendingRunsResult> {
  return await db.transaction(async (tx) => {
    const pending = await findPendingEmitRuns(tx);

    const result: EmitPendingRunsResult = {
      considered: pending.length,
      emitted: 0,
      failed: 0,
    };

    for (const run of pending) {
      const scheduledForIso = run.scheduledFor.toISOString();
      const eventId = `${run.scheduledTaskId}:${scheduledForIso}`;

      try {
        await inngest.send(
          scheduledTaskDueEvent.create(
            {
              runId: run.id,
              scheduledTaskId: run.scheduledTaskId,
              scheduledFor: scheduledForIso,
            },
            { id: eventId },
          ),
        );
      } catch {
        // Leave the row pending so the next cron tick retries.
        result.failed += 1;
        continue;
      }

      await updateScheduledTaskRunById(tx, run.id, {
        inngestEventId: eventId,
      });
      result.emitted += 1;
    }

    return result;
  });
}
