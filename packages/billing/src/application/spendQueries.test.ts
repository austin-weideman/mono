import { assert, describe, expect, it } from "vitest";

import type { Transaction } from "@mono/db/client";
import { systemActor, userActor } from "@mono/core-types";
import { conversation, usageEvent, user } from "@mono/db";
import { ForbiddenError } from "@mono/errors";
import { withTestTransaction } from "@mono/testing";

import { getUserConversationSpend } from "./getUserConversationSpend";
import { getUserTotalSpend } from "./getUserTotalSpend";

async function seedUser(tx: Transaction, id: string): Promise<string> {
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

async function seedConversation(
  tx: Transaction,
  userId: string,
): Promise<string> {
  const [conv] = await tx
    .insert(conversation)
    .values({ userId, title: "test" })
    .returning({ id: conversation.id });
  assert(conv);
  return conv.id;
}

async function seedEvent(
  tx: Transaction,
  userId: string,
  conversationId: string,
  generationId: string,
  costUsd: string,
): Promise<void> {
  await tx.insert(usageEvent).values({
    userId,
    conversationId,
    generationId,
    gatewayModelId: "anthropic/claude-sonnet-4.6",
    costUsd,
  });
}

describe("getUserConversationSpend (application)", () => {
  it("allows a user to query their own spend", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "spend-app-1");
      const conversationId = await seedConversation(tx, userId);
      await seedEvent(tx, userId, conversationId, "g1", "0.10000000");

      const total = await getUserConversationSpend(tx, userActor(userId), {
        userId,
        conversationId,
      });

      expect(total).toBe("0.10000000");
    });
  });

  it("forbids a user from querying another user's spend", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "spend-app-2a");
      const otherUserId = await seedUser(tx, "spend-app-2b");
      const conversationId = await seedConversation(tx, userId);

      await expect(
        getUserConversationSpend(tx, userActor(otherUserId), {
          userId,
          conversationId,
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });
  });

  it("allows a system actor to query any user's spend", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "spend-app-3");
      const conversationId = await seedConversation(tx, userId);
      await seedEvent(tx, userId, conversationId, "g3", "0.42000000");

      const total = await getUserConversationSpend(tx, systemActor("test"), {
        userId,
        conversationId,
      });

      expect(total).toBe("0.42000000");
    });
  });
});

describe("getUserTotalSpend (application)", () => {
  it("allows a user to query their own total spend", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "total-app-1");
      const conversationId = await seedConversation(tx, userId);
      await seedEvent(tx, userId, conversationId, "t1", "0.05000000");
      await seedEvent(tx, userId, conversationId, "t2", "0.07000000");

      const total = await getUserTotalSpend(tx, userActor(userId), { userId });

      expect(total).toBe("0.12000000");
    });
  });

  it("forbids a user from querying another user's total", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "total-app-2a");
      const otherUserId = await seedUser(tx, "total-app-2b");

      await expect(
        getUserTotalSpend(tx, userActor(otherUserId), { userId }),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });
  });

  it("allows a system actor to query any user's total", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "total-app-3");
      const conversationId = await seedConversation(tx, userId);
      await seedEvent(tx, userId, conversationId, "t3", "0.99000000");

      const total = await getUserTotalSpend(tx, systemActor("test"), {
        userId,
      });

      expect(total).toBe("0.99000000");
    });
  });
});
