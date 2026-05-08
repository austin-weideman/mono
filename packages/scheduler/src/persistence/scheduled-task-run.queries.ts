import { and, desc, eq, lt, or } from "drizzle-orm";

import type { DbOrTx } from "@microlearn/db/client";
import { scheduledTaskRun } from "@microlearn/db";

import type { ScheduledTaskRunCursor } from "../types/ListScheduledTaskRunsInput";
import type { ScheduledTaskRun } from "../types/ScheduledTaskRun";

export interface ListScheduledTaskRunsOptions {
  limit: number;
  cursor?: ScheduledTaskRunCursor;
}

export async function getScheduledTaskRunById(
  db: DbOrTx,
  id: string,
): Promise<ScheduledTaskRun | null> {
  const [row] = await db
    .select()
    .from(scheduledTaskRun)
    .where(eq(scheduledTaskRun.id, id))
    .limit(1);
  return row ?? null;
}

export async function listScheduledTaskRunsForTask(
  db: DbOrTx,
  scheduledTaskId: string,
  options: ListScheduledTaskRunsOptions,
): Promise<ScheduledTaskRun[]> {
  const { limit, cursor } = options;
  return await db
    .select()
    .from(scheduledTaskRun)
    .where(
      and(
        eq(scheduledTaskRun.scheduledTaskId, scheduledTaskId),
        cursor
          ? or(
              lt(scheduledTaskRun.scheduledFor, cursor.scheduledFor),
              and(
                eq(scheduledTaskRun.scheduledFor, cursor.scheduledFor),
                lt(scheduledTaskRun.id, cursor.id),
              ),
            )
          : undefined,
      ),
    )
    .orderBy(desc(scheduledTaskRun.scheduledFor), desc(scheduledTaskRun.id))
    .limit(limit + 1);
}
