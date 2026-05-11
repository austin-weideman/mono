import { describe, expect, it } from "vitest";

import type { Transaction } from "@mono/db/client";
import { ActorType, userActor } from "@mono/core-types";
import { user } from "@mono/db";
import { ForbiddenError, NotFoundError } from "@mono/errors";
import { withTestTransaction } from "@mono/testing";

import { getScheduledTaskById } from "../persistence/scheduled-task.queries";
import { createScheduledTask } from "./createScheduledTask";
import { deleteScheduledTask } from "./deleteScheduledTask";

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

describe("deleteScheduledTask", () => {
  it("soft-deletes the task: subsequent getScheduledTaskById returns null", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-del-1");
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

      await deleteScheduledTask(tx, userActor(u), { id: created.id });
      const fetched = await getScheduledTaskById(tx, created.id);
      expect(fetched).toBeNull();
    });
  });

  it("rejects another user's delete with ForbiddenError", async () => {
    await withTestTransaction(async (tx) => {
      const owner = await createTestUser(tx, "u-del-owner");
      const other = await createTestUser(tx, "u-del-other");
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
        deleteScheduledTask(tx, userActor(other), { id: created.id }),
      ).rejects.toThrow(ForbiddenError);

      // And the task is still visible to the owner.
      const stillThere = await getScheduledTaskById(tx, created.id);
      expect(stillThere).not.toBeNull();
    });
  });

  it("404 when task does not exist", async () => {
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-del-404");
      await expect(
        deleteScheduledTask(tx, userActor(u), {
          id: "00000000-0000-0000-0000-000000000000",
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  it("delete is idempotent in the sense that a re-delete throws NotFoundError", async () => {
    // Once archived, getScheduledTaskById filters it out, so the second
    // delete sees no row and surfaces NotFoundError instead of double-archiving.
    await withTestTransaction(async (tx) => {
      const u = await createTestUser(tx, "u-del-idem");
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
      await deleteScheduledTask(tx, userActor(u), { id: created.id });
      await expect(
        deleteScheduledTask(tx, userActor(u), { id: created.id }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
