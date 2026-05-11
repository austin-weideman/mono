import { eq, inArray } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import type { Transaction } from "@microlearn/db/client";
import { ActorType } from "@microlearn/core-types";
import {
  scheduledTask,
  scheduledTaskRun,
  ScheduledTaskRunStatus,
  ScheduledTaskStatus,
  user,
} from "@microlearn/db";
import { withTestTransaction } from "@microlearn/testing";

import { insertScheduledTask } from "../persistence/scheduled-task.mutations";
import { dispatchDue } from "./dispatchDue";

async function createTestUser(tx: Transaction, id: string): Promise<string> {
  await tx.insert(user).values({
    id,
    name: `Test ${id}`,
    email: `${id}@test.com`,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

describe("dispatchDue", () => {
  it("creates a pending run row and advances nextRunAt for due active schedules", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "u-dispatch-due");
      const dueAt = new Date("2026-05-08T09:00:00Z");
      const now = new Date("2026-05-08T09:00:30Z");

      const task = await insertScheduledTask(tx, {
        userId,
        actorType: ActorType.USER,
        name: "test schedule",
        taskType: "scheduled_chat",
        payload: { prompt: "hi", gatewayModelId: "openai/gpt-4o" },
        rrule: "FREQ=DAILY;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
        dtstart: dueAt,
        timezone: "UTC",
        nextRunAt: dueAt,
      });

      const result = await dispatchDue(tx, now);

      expect(result.dispatched).toBe(1);
      expect(result.completed).toBe(0);
      expect(result.failed).toBe(0);

      const runs = await tx
        .select()
        .from(scheduledTaskRun)
        .where(eq(scheduledTaskRun.scheduledTaskId, task.id));
      expect(runs).toHaveLength(1);
      expect(runs[0]?.status).toBe(ScheduledTaskRunStatus.PENDING);
      expect(runs[0]?.scheduledFor.toISOString()).toBe(dueAt.toISOString());
      expect(runs[0]?.inngestEventId).toBeNull();

      const [advanced] = await tx
        .select()
        .from(scheduledTask)
        .where(eq(scheduledTask.id, task.id));
      expect(advanced?.status).toBe(ScheduledTaskStatus.ACTIVE);
      expect(advanced?.nextRunAt.getTime()).toBeGreaterThan(now.getTime());
      expect(advanced?.lastRunId).toBe(runs[0]?.id);
    });
  });

  it("ignores schedules whose nextRunAt is in the future", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "u-dispatch-future");
      const now = new Date();
      const future = new Date(now.getTime() + 60 * 60 * 1000);

      const task = await insertScheduledTask(tx, {
        userId,
        actorType: ActorType.USER,
        name: "test schedule",
        taskType: "scheduled_chat",
        payload: {},
        rrule: "FREQ=DAILY",
        dtstart: future,
        timezone: "UTC",
        nextRunAt: future,
      });

      await dispatchDue(tx, now);

      const runs = await tx
        .select()
        .from(scheduledTaskRun)
        .where(eq(scheduledTaskRun.scheduledTaskId, task.id));
      expect(runs).toHaveLength(0);

      const [unchanged] = await tx
        .select()
        .from(scheduledTask)
        .where(eq(scheduledTask.id, task.id));
      expect(unchanged?.nextRunAt.toISOString()).toBe(future.toISOString());
    });
  });

  it("ignores paused/completed/failed schedules", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "u-dispatch-status");
      const dueAt = new Date("2026-05-08T09:00:00Z");
      const now = new Date("2026-05-08T09:00:30Z");

      const make = async (status: ScheduledTaskStatus): Promise<string> => {
        const t = await insertScheduledTask(tx, {
          userId,
          actorType: ActorType.USER,
          name: "test schedule",
          taskType: "scheduled_chat",
          payload: {},
          rrule: "FREQ=DAILY",
          dtstart: dueAt,
          timezone: "UTC",
          nextRunAt: dueAt,
        });
        await tx
          .update(scheduledTask)
          .set({ status })
          .where(eq(scheduledTask.id, t.id));
        return t.id;
      };

      const paused = await make(ScheduledTaskStatus.PAUSED);
      const completed = await make(ScheduledTaskStatus.COMPLETED);
      const failed = await make(ScheduledTaskStatus.FAILED);

      await dispatchDue(tx, now);

      const ourTaskIds = [paused, completed, failed];
      const runs = await tx
        .select()
        .from(scheduledTaskRun)
        .where(inArray(scheduledTaskRun.scheduledTaskId, ourTaskIds));
      expect(runs).toHaveLength(0);

      const tasks = await tx
        .select()
        .from(scheduledTask)
        .where(inArray(scheduledTask.id, ourTaskIds));
      expect(tasks.map((t) => t.status).sort()).toEqual(
        [
          ScheduledTaskStatus.PAUSED,
          ScheduledTaskStatus.COMPLETED,
          ScheduledTaskStatus.FAILED,
        ].sort(),
      );
    });
  });

  it("marks schedules with exhausted rrules as completed", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "u-dispatch-completed");
      const dueAt = new Date("2026-05-08T09:00:00Z");
      const now = new Date("2026-05-08T09:00:30Z");

      // COUNT=1 → after dispatch, computeNextRun(after=now) returns null.
      const task = await insertScheduledTask(tx, {
        userId,
        actorType: ActorType.USER,
        name: "test schedule",
        taskType: "scheduled_chat",
        payload: {},
        rrule: "FREQ=DAILY;COUNT=1",
        dtstart: dueAt,
        timezone: "UTC",
        nextRunAt: dueAt,
      });

      const result = await dispatchDue(tx, now);
      expect(result.dispatched).toBe(1);
      expect(result.completed).toBe(1);

      const [updated] = await tx
        .select()
        .from(scheduledTask)
        .where(eq(scheduledTask.id, task.id));
      expect(updated?.status).toBe(ScheduledTaskStatus.COMPLETED);
    });
  });

  it("marks malformed rrules as failed and continues with the rest of the batch", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "u-dispatch-failed");
      const dueAt = new Date("2026-05-08T09:00:00Z");
      const now = new Date("2026-05-08T09:00:30Z");

      const goodTask = await insertScheduledTask(tx, {
        userId,
        actorType: ActorType.USER,
        name: "test schedule",
        taskType: "scheduled_chat",
        payload: {},
        rrule: "FREQ=DAILY",
        dtstart: dueAt,
        timezone: "UTC",
        nextRunAt: dueAt,
      });

      // Bypass createScheduledTask validation to simulate an rrule that
      // parsed at write time but now throws (e.g. library upgrade).
      const badTask = await insertScheduledTask(tx, {
        userId,
        actorType: ActorType.USER,
        name: "test schedule",
        taskType: "scheduled_chat",
        payload: {},
        rrule: "NOT_A_REAL_RRULE",
        dtstart: dueAt,
        timezone: "UTC",
        nextRunAt: dueAt,
      });

      await dispatchDue(tx, now);

      const [good] = await tx
        .select()
        .from(scheduledTask)
        .where(eq(scheduledTask.id, goodTask.id));
      expect(good?.status).toBe(ScheduledTaskStatus.ACTIVE);

      const goodRuns = await tx
        .select()
        .from(scheduledTaskRun)
        .where(eq(scheduledTaskRun.scheduledTaskId, goodTask.id));
      expect(goodRuns).toHaveLength(1);

      const [bad] = await tx
        .select()
        .from(scheduledTask)
        .where(eq(scheduledTask.id, badTask.id));
      expect(bad?.status).toBe(ScheduledTaskStatus.FAILED);

      const badRuns = await tx
        .select()
        .from(scheduledTaskRun)
        .where(eq(scheduledTaskRun.scheduledTaskId, badTask.id));
      expect(badRuns).toHaveLength(0);
    });
  });

  it("is idempotent — re-running with the same scheduledFor does not create duplicate runs", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "u-dispatch-idem");
      const dueAt = new Date("2026-05-08T09:00:00Z");
      const now = new Date("2026-05-08T09:00:30Z");

      const task = await insertScheduledTask(tx, {
        userId,
        actorType: ActorType.USER,
        name: "test schedule",
        taskType: "scheduled_chat",
        payload: {},
        rrule: "FREQ=DAILY",
        dtstart: dueAt,
        timezone: "UTC",
        nextRunAt: dueAt,
      });

      await dispatchDue(tx, now);
      // Replay the same scheduledFor to hit the unique-constraint path.
      await tx
        .update(scheduledTask)
        .set({ nextRunAt: dueAt, status: ScheduledTaskStatus.ACTIVE })
        .where(eq(scheduledTask.id, task.id));
      await dispatchDue(tx, now);

      const runs = await tx
        .select()
        .from(scheduledTaskRun)
        .where(eq(scheduledTaskRun.scheduledTaskId, task.id));
      expect(runs).toHaveLength(1);
    });
  });
});
