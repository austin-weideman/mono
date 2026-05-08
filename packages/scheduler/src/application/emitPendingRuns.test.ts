import { eq } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";

import type { Transaction } from "@microlearn/db/client";
import { ActorType } from "@microlearn/core-types";
import { scheduledTaskRun, ScheduledTaskRunStatus, user } from "@microlearn/db";
import { withTestTransaction } from "@microlearn/testing";

import type { InngestSender } from "./emitPendingRuns";
import { insertScheduledTaskRun } from "../persistence/scheduled-task-run.mutations";
import { insertScheduledTask } from "../persistence/scheduled-task.mutations";
import { emitPendingRuns } from "./emitPendingRuns";

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

interface SeededRun {
  taskId: string;
  runId: string;
  scheduledFor: Date;
}

async function seedPendingRun(
  tx: Transaction,
  userId: string,
  scheduledFor: Date,
): Promise<SeededRun> {
  const task = await insertScheduledTask(tx, {
    userId,
    actorType: ActorType.USER,
    taskType: "scheduled_chat",
    payload: {},
    rrule: "FREQ=DAILY",
    dtstart: scheduledFor,
    timezone: "UTC",
    nextRunAt: scheduledFor,
  });
  const run = await insertScheduledTaskRun(tx, {
    scheduledTaskId: task.id,
    scheduledFor,
  });
  return { taskId: task.id, runId: run.id, scheduledFor };
}

function fakeSender(
  impl: (event: unknown) => Promise<void> | void = () => undefined,
): { sender: InngestSender; sendMock: ReturnType<typeof vi.fn> } {
  const sendMock = vi.fn(impl);
  return {
    sender: { send: sendMock } as unknown as InngestSender,
    sendMock,
  };
}

describe("emitPendingRuns", () => {
  it("composes the event id as `${scheduledTaskId}:${scheduledFor.toISOString()}` and marks the row emitted", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "u-emit-id");
      const scheduledFor = new Date("2026-05-08T09:00:00Z");
      const seeded = await seedPendingRun(tx, userId, scheduledFor);

      const { sender, sendMock } = fakeSender();

      const result = await emitPendingRuns(
        tx,
        sender,
        new Date("2026-05-08T09:00:30Z"),
      );

      expect(result.emitted).toBe(1);
      expect(sendMock).toHaveBeenCalledTimes(1);

      const sent = sendMock.mock.calls[0]?.[0] as {
        name: string;
        id: string;
        data: { runId: string; scheduledTaskId: string; scheduledFor: string };
      };
      expect(sent.name).toBe("scheduled_task/due");
      expect(sent.id).toBe(`${seeded.taskId}:${scheduledFor.toISOString()}`);
      expect(sent.data).toEqual({
        runId: seeded.runId,
        scheduledTaskId: seeded.taskId,
        scheduledFor: scheduledFor.toISOString(),
      });

      const [row] = await tx
        .select()
        .from(scheduledTaskRun)
        .where(eq(scheduledTaskRun.id, seeded.runId));
      expect(row?.inngestEventId).toBe(sent.id);
      expect(row?.status).toBe(ScheduledTaskRunStatus.PENDING);
    });
  });

  it("leaves the row pending and inngestEventId NULL when send throws", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "u-emit-fail");
      const seeded = await seedPendingRun(
        tx,
        userId,
        new Date("2026-05-08T09:00:00Z"),
      );

      const { sender, sendMock } = fakeSender(() => {
        throw new Error("simulated inngest outage");
      });

      const result = await emitPendingRuns(tx, sender, new Date());
      expect(result.failed).toBe(1);
      expect(result.emitted).toBe(0);
      expect(sendMock).toHaveBeenCalledTimes(1);

      const [row] = await tx
        .select()
        .from(scheduledTaskRun)
        .where(eq(scheduledTaskRun.id, seeded.runId));
      expect(row?.inngestEventId).toBeNull();
      expect(row?.status).toBe(ScheduledTaskRunStatus.PENDING);
    });
  });

  it("re-attempts pending rows on subsequent calls", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "u-emit-retry");
      const seeded = await seedPendingRun(
        tx,
        userId,
        new Date("2026-05-08T09:00:00Z"),
      );

      let callCount = 0;
      const { sender, sendMock } = fakeSender(() => {
        callCount += 1;
        if (callCount === 1) throw new Error("first call fails");
      });

      await emitPendingRuns(tx, sender, new Date());
      const second = await emitPendingRuns(tx, sender, new Date());

      expect(sendMock).toHaveBeenCalledTimes(2);
      expect(second.emitted).toBe(1);

      const [row] = await tx
        .select()
        .from(scheduledTaskRun)
        .where(eq(scheduledTaskRun.id, seeded.runId));
      expect(row?.inngestEventId).not.toBeNull();
    });
  });

  it("ignores rows that already have an inngestEventId", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "u-emit-skip");
      const seeded = await seedPendingRun(
        tx,
        userId,
        new Date("2026-05-08T09:00:00Z"),
      );
      await tx
        .update(scheduledTaskRun)
        .set({ inngestEventId: "already-emitted" })
        .where(eq(scheduledTaskRun.id, seeded.runId));

      const { sender, sendMock } = fakeSender();
      const result = await emitPendingRuns(tx, sender, new Date());

      expect(result.considered).toBe(0);
      expect(sendMock).not.toHaveBeenCalled();
    });
  });
});
