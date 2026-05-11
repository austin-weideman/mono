import type { Inngest } from "inngest";

import type { DbOrTx } from "@mono/db/client";
import { scheduledTaskDueEvent } from "@mono/jobs/events/scheduler";

import { updateScheduledTaskRunById } from "../persistence/scheduled-task-run.mutations";
import { findPendingEmitRuns } from "../persistence/scheduled-task-run.queries";

export type InngestSender = Pick<Inngest.Any, "send">;

export interface EmitPendingRunsResult {
  considered: number;
  emitted: number;
  failed: number;
}

// Outbox emit: runs after the dispatch txn commits. inngest.send() must NOT
// happen inside a DB transaction — the pending row IS the outbox, and a
// failed send leaves the row to be retried on the next tick.
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
