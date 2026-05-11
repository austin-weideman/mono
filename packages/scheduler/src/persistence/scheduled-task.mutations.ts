import { eq, sql } from "drizzle-orm";

import type { DbOrTx } from "@mono/db/client";
import { scheduledTask } from "@mono/db";
import { InternalServerError } from "@mono/errors";

import type { ScheduledTask } from "../types/ScheduledTask";
import type { ScheduledTaskActorType } from "../types/ScheduledTaskActorType";
import type { ScheduledTaskStatus } from "../types/ScheduledTaskStatus";

export interface InsertScheduledTaskInput {
  userId: string | null;
  actorType: ScheduledTaskActorType;
  name: string;
  taskType: string;
  payload: unknown;
  rrule: string;
  dtstart: Date;
  timezone: string;
  nextRunAt: Date;
}

export async function insertScheduledTask(
  db: DbOrTx,
  input: InsertScheduledTaskInput,
): Promise<ScheduledTask> {
  const [row] = await db
    .insert(scheduledTask)
    .values({
      userId: input.userId,
      actorType: input.actorType,
      name: input.name,
      taskType: input.taskType,
      payload: input.payload,
      rrule: input.rrule,
      dtstart: input.dtstart,
      timezone: input.timezone,
      nextRunAt: input.nextRunAt,
    })
    .returning();

  if (!row) {
    throw new InternalServerError("Failed to insert scheduled_task");
  }
  return row;
}

export interface UpdateScheduledTaskFieldsInput {
  name?: string;
  rrule?: string;
  timezone?: string;
  dtstart?: Date;
  payload?: unknown;
  nextRunAt?: Date;
  status?: ScheduledTaskStatus;
  lastRunId?: string | null;
}

export async function updateScheduledTaskById(
  db: DbOrTx,
  id: string,
  patch: UpdateScheduledTaskFieldsInput,
): Promise<ScheduledTask> {
  const [row] = await db
    .update(scheduledTask)
    .set({
      ...patch,
      updatedAt: sql`NOW()`,
    })
    .where(eq(scheduledTask.id, id))
    .returning();

  if (!row) {
    throw new InternalServerError(`Failed to update scheduled_task: ${id}`);
  }
  return row;
}

export async function archiveScheduledTask(
  db: DbOrTx,
  id: string,
): Promise<void> {
  const result = await db
    .update(scheduledTask)
    .set({ archivedAt: sql`NOW()` })
    .where(eq(scheduledTask.id, id))
    .returning({ id: scheduledTask.id });

  if (result.length === 0) {
    throw new InternalServerError(`Failed to archive scheduled_task: ${id}`);
  }
}
