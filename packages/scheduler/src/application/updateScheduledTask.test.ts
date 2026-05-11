import { describe, expect, it } from "vitest";

import type { Transaction } from "@microlearn/db/client";
import { ActorType, userActor } from "@microlearn/core-types";
import { user } from "@microlearn/db";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@microlearn/errors";
import { withTestTransaction } from "@microlearn/testing";

import { createScheduledTask } from "./createScheduledTask";
import { updateScheduledTask } from "./updateScheduledTask";

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

describe("updateScheduledTask", () => {
  it("recomputes nextRunAt when rrule changes", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-upd-rrule");
      const created = await createScheduledTask(
        tx,
        userActor(u),
        {
          actorType: ActorType.USER,
          userId: u,
          name: "test schedule",
          taskType: "x",
          payload: {},
          rrule: "FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
          timezone: "America/New_York",
        },
        new Date("2026-01-01T00:00:00Z"),
      );

      const now = new Date("2026-01-06T18:00:00Z"); // Tue 1pm EST
      const updated = await updateScheduledTask(
        tx,
        userActor(u),
        {
          id: created.id,
          rrule: "FREQ=WEEKLY;BYDAY=FR;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
        },
        now,
      );

      // Next Fri 9am EST after Tue 1pm = Jan 9 14:00 UTC
      expect(updated.nextRunAt.toISOString()).toBe("2026-01-09T14:00:00.000Z");
      expect(updated.rrule).toBe(
        "FREQ=WEEKLY;BYDAY=FR;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
      );
    });
  });

  it("recomputes nextRunAt when timezone changes", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-upd-tz");
      const created = await createScheduledTask(
        tx,
        userActor(u),
        {
          actorType: ActorType.USER,
          userId: u,
          name: "test schedule",
          taskType: "x",
          payload: {},
          rrule: "FREQ=DAILY;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
          timezone: "America/New_York",
        },
        new Date("2026-06-01T00:00:00Z"),
      );

      const now = new Date("2026-06-01T20:00:00Z"); // 4pm EDT
      const updated = await updateScheduledTask(
        tx,
        userActor(u),
        { id: created.id, timezone: "America/Los_Angeles" },
        now,
      );

      // Next 9am LA after 4pm EDT = June 2 16:00 UTC (9am PDT)
      expect(updated.nextRunAt.toISOString()).toBe("2026-06-02T16:00:00.000Z");
      expect(updated.timezone).toBe("America/Los_Angeles");
    });
  });

  it("does NOT recompute nextRunAt when only payload changes", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-upd-payload");
      const created = await createScheduledTask(
        tx,
        userActor(u),
        {
          actorType: ActorType.USER,
          userId: u,
          name: "test schedule",
          taskType: "x",
          payload: { v: 1 },
          rrule: "FREQ=DAILY;BYHOUR=9",
          timezone: "America/New_York",
        },
        new Date("2026-01-01T00:00:00Z"),
      );

      const updated = await updateScheduledTask(
        tx,
        userActor(u),
        { id: created.id, payload: { v: 2 } },
        new Date("2026-06-15T00:00:00Z"),
      );

      expect(updated.nextRunAt.toISOString()).toBe(
        created.nextRunAt.toISOString(),
      );
      expect(updated.payload).toEqual({ v: 2 });
    });
  });

  it("rejects updates from another user", async () => {
    await withTestTransaction(async (tx) => {
      const owner = await createTestUser(tx, "u-owner");
      const other = await createTestUser(tx, "u-other");
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
        updateScheduledTask(
          tx,
          userActor(other),
          { id: created.id, payload: { hacked: true } },
          new Date(),
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  it("404 when task does not exist", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-404");
      await expect(
        updateScheduledTask(
          tx,
          userActor(u),
          {
            id: "00000000-0000-0000-0000-000000000000",
            payload: {},
          },
          new Date(),
        ),
      ).rejects.toThrow(NotFoundError);
    });
  });

  it("rejects new rrule that produces no future occurrences", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-no-future");
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
        new Date("2026-01-01T00:00:00Z"),
      );
      await expect(
        updateScheduledTask(
          tx,
          userActor(u),
          {
            id: created.id,
            rrule: "FREQ=DAILY;UNTIL=20200101T000000Z",
          },
          new Date("2026-01-01T00:00:00Z"),
        ),
      ).rejects.toThrow(BadRequestError);
    });
  });
});
