import { describe, expect, it } from "vitest";

import type { SystemActor } from "@microlearn/core-types";
import type { Transaction } from "@microlearn/db/client";
import { ActorType, systemActor, userActor } from "@microlearn/core-types";
import { user } from "@microlearn/db";
import { BadRequestError, ForbiddenError } from "@microlearn/errors";
import { withTestTransaction } from "@microlearn/testing";

import { createScheduledTask } from "./createScheduledTask";

const SYS: SystemActor = systemActor("test");

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

describe("createScheduledTask", () => {
  it("creates a USER task and computes nextRunAt as the first matching occurrence", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await createTestUser(tx, "user-create-1");
      const now = new Date("2026-01-05T18:00:00Z"); // Mon 1pm EST

      const task = await createScheduledTask(
        tx,
        userActor(userId),
        {
          actorType: ActorType.USER,
          userId,
          taskType: "test_task",
          payload: { foo: "bar" },
          rrule: "FREQ=WEEKLY;BYDAY=TU;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
          timezone: "America/New_York",
        },
        now,
      );

      expect(task.userId).toBe(userId);
      expect(task.actorType).toBe(ActorType.USER);
      expect(task.status).toBe("active");
      // Next Tue 9am EST after Mon 1pm EST → Jan 6 14:00 UTC
      expect(task.nextRunAt.toISOString()).toBe("2026-01-06T14:00:00.000Z");
    });
  });

  it("creates a SYSTEM task with userId=null", async () => {
    await withTestTransaction(async (tx) => {
      const now = new Date("2026-01-01T00:00:00Z");
      const task = await createScheduledTask(
        tx,
        SYS,
        {
          actorType: ActorType.SYSTEM,
          userId: null,
          taskType: "system_sweep",
          payload: {},
          rrule: "FREQ=DAILY;BYHOUR=3",
          timezone: "UTC",
        },
        now,
      );
      expect(task.userId).toBeNull();
      expect(task.actorType).toBe(ActorType.SYSTEM);
    });
  });

  it("rejects USER actor creating task for another user", async () => {
    await withTestTransaction(async (tx) => {
      await createTestUser(tx, "owner");
      await createTestUser(tx, "other");
      await expect(
        createScheduledTask(
          tx,
          userActor("other"),
          {
            actorType: ActorType.USER,
            userId: "owner",
            taskType: "x",
            payload: {},
            rrule: "FREQ=DAILY",
            timezone: "UTC",
          },
          new Date(),
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  it("rejects USER actor creating SYSTEM tasks", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "user-no-sys");
      await expect(
        createScheduledTask(
          tx,
          userActor(u),
          {
            actorType: ActorType.SYSTEM,
            userId: null,
            taskType: "x",
            payload: {},
            rrule: "FREQ=DAILY",
            timezone: "UTC",
          },
          new Date(),
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  it("rejects USER task without userId", async () => {
    await withTestTransaction(async (tx) => {
      await expect(
        createScheduledTask(
          tx,
          SYS,
          {
            actorType: ActorType.USER,
            userId: null,
            taskType: "x",
            payload: {},
            rrule: "FREQ=DAILY",
            timezone: "UTC",
          },
          new Date(),
        ),
      ).rejects.toThrow(BadRequestError);
    });
  });

  it("rejects SYSTEM task with userId set", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "user-sys-bad");
      await expect(
        createScheduledTask(
          tx,
          SYS,
          {
            actorType: ActorType.SYSTEM,
            userId: u,
            taskType: "x",
            payload: {},
            rrule: "FREQ=DAILY",
            timezone: "UTC",
          },
          new Date(),
        ),
      ).rejects.toThrow(BadRequestError);
    });
  });

  it("rejects invalid timezone", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "user-bad-tz");
      await expect(
        createScheduledTask(
          tx,
          userActor(u),
          {
            actorType: ActorType.USER,
            userId: u,
            taskType: "x",
            payload: {},
            rrule: "FREQ=DAILY",
            timezone: "Not/A_Zone",
          },
          new Date(),
        ),
      ).rejects.toThrow(BadRequestError);
    });
  });

  it("rejects malformed rrule", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "user-bad-rule");
      await expect(
        createScheduledTask(
          tx,
          userActor(u),
          {
            actorType: ActorType.USER,
            userId: u,
            taskType: "x",
            payload: {},
            rrule: "NOT_VALID",
            timezone: "UTC",
          },
          new Date(),
        ),
      ).rejects.toThrow(BadRequestError);
    });
  });

  it("rejects rrule that produces no occurrences (UNTIL in past)", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "user-exhausted");
      await expect(
        createScheduledTask(
          tx,
          userActor(u),
          {
            actorType: ActorType.USER,
            userId: u,
            taskType: "x",
            payload: {},
            rrule: "FREQ=DAILY;UNTIL=20200101T000000Z",
            timezone: "UTC",
            dtstart: new Date("2019-01-01T00:00:00Z"),
          },
          new Date("2026-01-01T00:00:00Z"),
        ),
      ).rejects.toThrow(BadRequestError);
    });
  });
});
