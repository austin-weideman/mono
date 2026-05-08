import { and, desc, eq, isNull } from "drizzle-orm";

import type { DbOrTx } from "@microlearn/db/client";
import { scheduledTask } from "@microlearn/db";

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
