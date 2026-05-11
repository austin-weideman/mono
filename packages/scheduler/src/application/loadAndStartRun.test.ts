import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import type { Transaction } from "@microlearn/db/client";
import { ActorType } from "@microlearn/core-types";
import { scheduledTaskRun, ScheduledTaskRunStatus, user } from "@microlearn/db";
import { NotFoundError } from "@microlearn/errors";
import { withTestTransaction } from "@microlearn/testing";

import { insertScheduledTaskRun } from "../persistence/scheduled-task-run.mutations";
import { insertScheduledTask } from "../persistence/scheduled-task.mutations";
import { loadAndStartRun } from "./loadAndStartRun";

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

describe("loadAndStartRun", () => {
  it("returns a USER actor for USER schedules and sets the run to running", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "u-load-user");
      const task = await insertScheduledTask(tx, {
        userId,
        actorType: ActorType.USER,
        name: "test schedule",
        taskType: "scheduled_chat",
        payload: { prompt: "p", gatewayModelId: "m" },
        rrule: "FREQ=DAILY",
        dtstart: new Date("2026-05-08T09:00:00Z"),
        timezone: "UTC",
        nextRunAt: new Date("2026-05-08T09:00:00Z"),
      });
      const run = await insertScheduledTaskRun(tx, {
        scheduledTaskId: task.id,
        scheduledFor: new Date("2026-05-08T09:00:00Z"),
      });

      const loaded = await loadAndStartRun(tx, run.id);

      expect(loaded.taskType).toBe("scheduled_chat");
      expect(loaded.actor).toEqual({ type: ActorType.USER, userId });
      expect(loaded.payload).toEqual({ prompt: "p", gatewayModelId: "m" });
      expect(loaded.scheduledForIso).toBe("2026-05-08T09:00:00.000Z");

      const [updated] = await tx
        .select()
        .from(scheduledTaskRun)
        .where(eq(scheduledTaskRun.id, run.id));
      expect(updated?.status).toBe(ScheduledTaskRunStatus.RUNNING);
    });
  });

  it("returns a SYSTEM actor for SYSTEM schedules", async () => {
    await withTestTransaction(async (tx) => {
      const task = await insertScheduledTask(tx, {
        userId: null,
        actorType: ActorType.SYSTEM,
        name: "test schedule",
        taskType: "scheduled_chat",
        payload: {},
        rrule: "FREQ=DAILY",
        dtstart: new Date("2026-05-08T09:00:00Z"),
        timezone: "UTC",
        nextRunAt: new Date("2026-05-08T09:00:00Z"),
      });
      const run = await insertScheduledTaskRun(tx, {
        scheduledTaskId: task.id,
        scheduledFor: new Date("2026-05-08T09:00:00Z"),
      });

      const loaded = await loadAndStartRun(tx, run.id);
      expect(loaded.actor).toEqual({
        type: ActorType.SYSTEM,
        service: "scheduler",
      });
    });
  });

  it("throws NotFoundError when the run does not exist", async () => {
    await withTestTransaction(async (tx) => {
      await expect(
        loadAndStartRun(tx, "00000000-0000-0000-0000-000000000000"),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
