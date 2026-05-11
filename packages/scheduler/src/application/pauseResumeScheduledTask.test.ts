import { describe, expect, it } from "vitest";

import type { Transaction } from "@microlearn/db/client";
import { ActorType, userActor } from "@microlearn/core-types";
import { user } from "@microlearn/db";
import { BadRequestError, ForbiddenError } from "@microlearn/errors";
import { withTestTransaction } from "@microlearn/testing";

import { createScheduledTask } from "./createScheduledTask";
import { pauseScheduledTask } from "./pauseScheduledTask";
import { resumeScheduledTask } from "./resumeScheduledTask";

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

describe("pause / resume", () => {
  it("pause sets status='paused' and freezes nextRunAt", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-pause-1");
      const created = await createScheduledTask(
        tx,
        userActor(u),
        {
          actorType: ActorType.USER,
          userId: u,
          name: "test schedule",
          taskType: "x",
          payload: {},
          rrule: "FREQ=DAILY;BYHOUR=9",
          timezone: "America/New_York",
        },
        new Date("2026-01-01T00:00:00Z"),
      );
      const paused = await pauseScheduledTask(tx, userActor(u), {
        id: created.id,
      });
      expect(paused.status).toBe("paused");
      expect(paused.nextRunAt.toISOString()).toBe(
        created.nextRunAt.toISOString(),
      );
    });
  });

  it("resume after long pause does not fire-storm: nextRunAt jumps to now", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-resume-1");
      const created = await createScheduledTask(
        tx,
        userActor(u),
        {
          actorType: ActorType.USER,
          userId: u,
          name: "test schedule",
          taskType: "x",
          payload: {},
          rrule: "FREQ=DAILY;BYHOUR=9",
          timezone: "America/New_York",
        },
        new Date("2026-01-01T00:00:00Z"),
      );
      await pauseScheduledTask(tx, userActor(u), { id: created.id });

      const muchLater = new Date("2026-06-01T15:00:00Z");
      const resumed = await resumeScheduledTask(
        tx,
        userActor(u),
        { id: created.id },
        muchLater,
      );

      expect(resumed.status).toBe("active");
      expect(resumed.nextRunAt.toISOString()).toBe(muchLater.toISOString());
    });
  });

  it("resume keeps nextRunAt in the future when it's already in the future", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-resume-2");
      const created = await createScheduledTask(
        tx,
        userActor(u),
        {
          actorType: ActorType.USER,
          userId: u,
          name: "test schedule",
          taskType: "x",
          payload: {},
          rrule: "FREQ=DAILY;BYHOUR=9",
          timezone: "America/New_York",
        },
        new Date("2026-01-01T00:00:00Z"),
      );
      await pauseScheduledTask(tx, userActor(u), { id: created.id });

      // now is BEFORE the original nextRunAt
      const before = new Date("2026-01-01T00:00:00Z");
      const resumed = await resumeScheduledTask(
        tx,
        userActor(u),
        { id: created.id },
        before,
      );
      expect(resumed.nextRunAt.toISOString()).toBe(
        created.nextRunAt.toISOString(),
      );
    });
  });

  it("rejects resume of non-paused task", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-resume-3");
      const created = await createScheduledTask(
        tx,
        userActor(u),
        {
          actorType: ActorType.USER,
          userId: u,
          name: "test schedule",
          taskType: "x",
          payload: {},
          rrule: "FREQ=DAILY",
          timezone: "UTC",
        },
        new Date(),
      );
      await expect(
        resumeScheduledTask(tx, userActor(u), { id: created.id }, new Date()),
      ).rejects.toThrow(BadRequestError);
    });
  });

  it("pause forbidden for other user", async () => {
    await withTestTransaction(async (tx) => {
      const owner = await createTestUser(tx, "u-pause-owner");
      const other = await createTestUser(tx, "u-pause-other");
      const created = await createScheduledTask(
        tx,
        userActor(owner),
        {
          actorType: ActorType.USER,
          userId: owner,
          name: "test schedule",
          taskType: "x",
          payload: {},
          rrule: "FREQ=DAILY",
          timezone: "UTC",
        },
        new Date(),
      );
      await expect(
        pauseScheduledTask(tx, userActor(other), { id: created.id }),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
