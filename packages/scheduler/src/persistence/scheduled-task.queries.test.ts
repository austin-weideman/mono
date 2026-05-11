import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import type { Transaction } from "@mono/db/client";
import { ActorType } from "@mono/core-types";
import { scheduledTask, user } from "@mono/db";
import { withTestTransaction } from "@mono/testing";

import { insertScheduledTask } from "./scheduled-task.mutations";
import { loadScheduledTasksForUser } from "./scheduled-task.queries";

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

interface TaskOptions {
  userId: string;
  taskType?: string;
}

async function makeTask(tx: Transaction, opts: TaskOptions): Promise<string> {
  const t = await insertScheduledTask(tx, {
    userId: opts.userId,
    actorType: ActorType.USER,
    name: "test schedule",
    taskType: opts.taskType ?? "test",
    payload: {},
    rrule: "FREQ=DAILY",
    dtstart: new Date("2026-01-01T00:00:00Z"),
    timezone: "UTC",
    nextRunAt: new Date("2026-01-01T00:00:00Z"),
  });
  return t.id;
}

describe("loadScheduledTasksForUser", () => {
  it("returns empty array when user has no tasks", async () => {
    await withTestTransaction(async (tx) => {
      const result = await loadScheduledTasksForUser(tx, "no-such-user");
      expect(result).toEqual([]);
    });
  });

  it("returns only the requested user's tasks", async () => {
    await withTestTransaction(async (tx) => {
      const owner = await createTestUser(tx, "u-load-iso-owner");
      const other = await createTestUser(tx, "u-load-iso-other");

      await makeTask(tx, { userId: owner, taskType: "owned-1" });
      await makeTask(tx, { userId: owner, taskType: "owned-2" });
      await makeTask(tx, { userId: other, taskType: "other-1" });

      const result = await loadScheduledTasksForUser(tx, owner);
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.userId === owner)).toBe(true);
    });
  });

  it("excludes archived (soft-deleted) tasks", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-load-archived");
      const live = await makeTask(tx, { userId: u, taskType: "live" });
      const archived = await makeTask(tx, { userId: u, taskType: "archived" });

      await tx
        .update(scheduledTask)
        .set({ archivedAt: new Date() })
        .where(eq(scheduledTask.id, archived));

      const result = await loadScheduledTasksForUser(tx, u);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(live);
    });
  });

  it("orders tasks by createdAt descending (newest first)", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-load-order");
      const oldId = await makeTask(tx, { userId: u, taskType: "old" });
      const midId = await makeTask(tx, { userId: u, taskType: "mid" });
      const newId = await makeTask(tx, { userId: u, taskType: "new" });

      await tx
        .update(scheduledTask)
        .set({ createdAt: new Date("2026-01-01T00:00:00Z") })
        .where(eq(scheduledTask.id, oldId));
      await tx
        .update(scheduledTask)
        .set({ createdAt: new Date("2026-02-01T00:00:00Z") })
        .where(eq(scheduledTask.id, midId));
      await tx
        .update(scheduledTask)
        .set({ createdAt: new Date("2026-03-01T00:00:00Z") })
        .where(eq(scheduledTask.id, newId));

      const result = await loadScheduledTasksForUser(tx, u);
      expect(result.map((t) => t.id)).toEqual([newId, midId, oldId]);
    });
  });
});
