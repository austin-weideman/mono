import { describe, expect, it } from "vitest";

import type { Transaction } from "@microlearn/db/client";
import { ActorType } from "@microlearn/core-types";
import { user } from "@microlearn/db";
import { withTestTransaction } from "@microlearn/testing";

import { insertScheduledTaskRun } from "./scheduled-task-run.mutations";
import { listScheduledTaskRunsForTask } from "./scheduled-task-run.queries";
import { insertScheduledTask } from "./scheduled-task.mutations";

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

async function createTestTask(
  tx: Transaction,
  userId: string,
): Promise<string> {
  const task = await insertScheduledTask(tx, {
    userId,
    actorType: ActorType.USER,
    taskType: "test",
    payload: {},
    rrule: "FREQ=DAILY",
    dtstart: new Date("2026-01-01T00:00:00Z"),
    timezone: "UTC",
    nextRunAt: new Date("2026-01-01T00:00:00Z"),
  });
  return task.id;
}

describe("listScheduledTaskRunsForTask", () => {
  it("returns empty array when task has no runs", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-runs-empty");
      const taskId = await createTestTask(tx, u);
      const result = await listScheduledTaskRunsForTask(tx, taskId, {
        limit: 20,
      });
      expect(result).toEqual([]);
    });
  });

  it("returns only runs for the requested task", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-runs-iso");
      const taskA = await createTestTask(tx, u);
      const taskB = await createTestTask(tx, u);

      await insertScheduledTaskRun(tx, {
        scheduledTaskId: taskA,
        scheduledFor: new Date("2026-01-01T09:00:00Z"),
      });
      await insertScheduledTaskRun(tx, {
        scheduledTaskId: taskA,
        scheduledFor: new Date("2026-01-02T09:00:00Z"),
      });
      await insertScheduledTaskRun(tx, {
        scheduledTaskId: taskB,
        scheduledFor: new Date("2026-01-01T09:00:00Z"),
      });

      const result = await listScheduledTaskRunsForTask(tx, taskA, {
        limit: 20,
      });
      expect(result).toHaveLength(2);
      expect(result.every((r) => r.scheduledTaskId === taskA)).toBe(true);
    });
  });

  it("orders runs by scheduledFor descending (newest first)", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-runs-order");
      const taskId = await createTestTask(tx, u);

      const oldRun = await insertScheduledTaskRun(tx, {
        scheduledTaskId: taskId,
        scheduledFor: new Date("2026-01-01T09:00:00Z"),
      });
      const midRun = await insertScheduledTaskRun(tx, {
        scheduledTaskId: taskId,
        scheduledFor: new Date("2026-01-02T09:00:00Z"),
      });
      const newRun = await insertScheduledTaskRun(tx, {
        scheduledTaskId: taskId,
        scheduledFor: new Date("2026-01-03T09:00:00Z"),
      });

      const result = await listScheduledTaskRunsForTask(tx, taskId, {
        limit: 10,
      });
      expect(result.map((r) => r.id)).toEqual([
        newRun.id,
        midRun.id,
        oldRun.id,
      ]);
    });
  });

  it("returns at most limit+1 rows (has-more sentinel)", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-runs-limit");
      const taskId = await createTestTask(tx, u);

      for (let i = 0; i < 5; i++) {
        await insertScheduledTaskRun(tx, {
          scheduledTaskId: taskId,
          scheduledFor: new Date(`2026-01-0${i + 1}T09:00:00Z`),
        });
      }

      const result = await listScheduledTaskRunsForTask(tx, taskId, {
        limit: 2,
      });
      // limit+1 = 3 rows returned so callers can detect more pages
      expect(result).toHaveLength(3);
    });
  });

  it("returns fewer than limit+1 when there are no further rows", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-runs-undersize");
      const taskId = await createTestTask(tx, u);

      await insertScheduledTaskRun(tx, {
        scheduledTaskId: taskId,
        scheduledFor: new Date("2026-01-01T09:00:00Z"),
      });

      const result = await listScheduledTaskRunsForTask(tx, taskId, {
        limit: 10,
      });
      expect(result).toHaveLength(1);
    });
  });

  it("paginates correctly via cursor", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-runs-cursor");
      const taskId = await createTestTask(tx, u);

      const r1 = await insertScheduledTaskRun(tx, {
        scheduledTaskId: taskId,
        scheduledFor: new Date("2026-01-01T09:00:00Z"),
      });
      const r2 = await insertScheduledTaskRun(tx, {
        scheduledTaskId: taskId,
        scheduledFor: new Date("2026-01-02T09:00:00Z"),
      });
      const r3 = await insertScheduledTaskRun(tx, {
        scheduledTaskId: taskId,
        scheduledFor: new Date("2026-01-03T09:00:00Z"),
      });

      const page1 = await listScheduledTaskRunsForTask(tx, taskId, {
        limit: 1,
      });
      expect(page1).toHaveLength(2);
      expect(page1[0]?.id).toBe(r3.id);

      const page2 = await listScheduledTaskRunsForTask(tx, taskId, {
        limit: 1,
        cursor: { id: r3.id, scheduledFor: r3.scheduledFor },
      });
      expect(page2).toHaveLength(2);
      expect(page2[0]?.id).toBe(r2.id);

      const page3 = await listScheduledTaskRunsForTask(tx, taskId, {
        limit: 1,
        cursor: { id: r2.id, scheduledFor: r2.scheduledFor },
      });
      expect(page3).toHaveLength(1);
      expect(page3[0]?.id).toBe(r1.id);
    });
  });

  it("paginates correctly through larger dataset", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-runs-large");
      const taskId = await createTestTask(tx, u);

      const baseTime = new Date("2026-01-01T00:00:00Z");
      const insertedIds: string[] = [];
      for (let i = 0; i < 25; i++) {
        const r = await insertScheduledTaskRun(tx, {
          scheduledTaskId: taskId,
          scheduledFor: new Date(baseTime.getTime() + i * 60_000),
        });
        insertedIds.push(r.id);
      }
      const expectedOrder = [...insertedIds].reverse();

      let collected: string[] = [];
      let cursor: { id: string; scheduledFor: Date } | undefined;
      for (let page = 0; page < 10; page++) {
        const rows = await listScheduledTaskRunsForTask(tx, taskId, {
          limit: 5,
          cursor,
        });
        if (rows.length === 0) break;

        const hasMore = rows.length > 5;
        const items = hasMore ? rows.slice(0, 5) : rows;
        collected = [...collected, ...items.map((r) => r.id)];

        if (!hasMore) break;
        const last = items[items.length - 1];
        if (!last) break;
        cursor = { id: last.id, scheduledFor: last.scheduledFor };
      }

      expect(collected).toHaveLength(25);
      expect(collected).toEqual(expectedOrder);
    });
  });
});
