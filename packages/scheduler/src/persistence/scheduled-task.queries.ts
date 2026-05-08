import { and, asc, desc, eq, isNull, lte } from "drizzle-orm";

import type { DbOrTx } from "@microlearn/db/client";
import { scheduledTask, ScheduledTaskStatus } from "@microlearn/db";

import type { ScheduledTask } from "../types/ScheduledTask";

export async function getScheduledTaskById(
  db: DbOrTx,
  id: string,
): Promise<ScheduledTask | null> {
  const [row] = await db
    .select()
    .from(scheduledTask)
    .where(and(eq(scheduledTask.id, id), isNull(scheduledTask.archivedAt)))
    .limit(1);
  return row ?? null;
}

export async function loadScheduledTasksForUser(
  db: DbOrTx,
  userId: string,
): Promise<ScheduledTask[]> {
  return await db
    .select()
    .from(scheduledTask)
    .where(
      and(eq(scheduledTask.userId, userId), isNull(scheduledTask.archivedAt)),
    )
    .orderBy(desc(scheduledTask.createdAt), desc(scheduledTask.id));
}

const DISPATCH_BATCH_LIMIT = 1000;

export async function findDueScheduledTasks(
  db: DbOrTx,
  now: Date,
  limit: number = DISPATCH_BATCH_LIMIT,
): Promise<ScheduledTask[]> {
  return await db
    .select()
    .from(scheduledTask)
    .where(
      and(
        eq(scheduledTask.status, ScheduledTaskStatus.ACTIVE),
        isNull(scheduledTask.archivedAt),
        lte(scheduledTask.nextRunAt, now),
      ),
    )
    .orderBy(asc(scheduledTask.nextRunAt))
    .limit(limit)
    .for("update", { skipLocked: true });
}
