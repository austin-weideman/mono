import { eq, sql } from "drizzle-orm";

import type { DbOrTx } from "@microlearn/db/client";
import { scheduledTaskRun } from "@microlearn/db";
import { InternalServerError } from "@microlearn/errors";

import type { ScheduledTaskRun } from "../types/ScheduledTaskRun";
import type { ScheduledTaskRunStatus } from "../types/ScheduledTaskRunStatus";

export interface InsertScheduledTaskRunInput {
  scheduledTaskId: string;
  scheduledFor: Date;
  status?: ScheduledTaskRunStatus;
}

export async function insertScheduledTaskRun(
  db: DbOrTx,
  input: InsertScheduledTaskRunInput,
): Promise<ScheduledTaskRun> {
  const [row] = await db
    .insert(scheduledTaskRun)
    .values({
      scheduledTaskId: input.scheduledTaskId,
      scheduledFor: input.scheduledFor,
      status: input.status,
    })
    .returning();

  if (!row) {
    throw new InternalServerError("Failed to insert scheduled_task_run");
  }
  return row;
}

// `onConflictDoUpdate` (no-op) instead of `onConflictDoNothing` so RETURNING
// always yields a row, even on the unique-constraint conflict path.
export async function upsertPendingScheduledTaskRun(
  db: DbOrTx,
  input: { scheduledTaskId: string; scheduledFor: Date },
): Promise<ScheduledTaskRun> {
  const [row] = await db
    .insert(scheduledTaskRun)
    .values({
      scheduledTaskId: input.scheduledTaskId,
      scheduledFor: input.scheduledFor,
    })
    .onConflictDoUpdate({
      target: [scheduledTaskRun.scheduledTaskId, scheduledTaskRun.scheduledFor],
      set: { scheduledFor: sql`excluded.scheduled_for` },
    })
    .returning();

  if (!row) {
    throw new InternalServerError("Failed to upsert scheduled_task_run");
  }
  return row;
}

export interface UpdateScheduledTaskRunFieldsInput {
  status?: ScheduledTaskRunStatus;
  inngestEventId?: string | null;
  completedAt?: Date | null;
  error?: unknown;
}

export async function updateScheduledTaskRunById(
  db: DbOrTx,
  id: string,
  patch: UpdateScheduledTaskRunFieldsInput,
): Promise<ScheduledTaskRun> {
  const [row] = await db
    .update(scheduledTaskRun)
    .set(patch)
    .where(eq(scheduledTaskRun.id, id))
    .returning();

  if (!row) {
    throw new InternalServerError(`Failed to update scheduled_task_run: ${id}`);
  }
  return row;
}
