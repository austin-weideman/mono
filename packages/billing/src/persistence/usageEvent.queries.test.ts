import { assert, describe, expect, it } from "vitest";

import type { Transaction } from "@mono/db/client";
import { conversation, usageEvent, user } from "@mono/db";
import { withTestTransaction } from "@mono/testing";

import {
  getUserConversationSpend,
  getUserTotalSpend,
} from "./usageEvent.queries";

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
  assert(conv, "failed to insert conversation");
  return conv.id;
}

interface InsertArgs {
  userId: string;
  conversationId: string;
  generationId: string;
  costUsd: string | null;
}

async function insertEvent(tx: Transaction, args: InsertArgs): Promise<void> {
  await tx.insert(usageEvent).values({
    userId: args.userId,
    conversationId: args.conversationId,
    generationId: args.generationId,
    gatewayModelId: "anthropic/claude-sonnet-4.6",
    costUsd: args.costUsd,
  });
}

describe("getUserConversationSpend", () => {
  it("sums all rows for the given user + conversation with exact decimal precision", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "ucs-user-1");
      const conversationId = await seedConversation(tx, userId);

      await insertEvent(tx, {
        userId,
        conversationId,
        generationId: "g1",
        costUsd: "0.00099975",
      });
      await insertEvent(tx, {
        userId,
        conversationId,
        generationId: "g2",
        costUsd: "0.00050000",
      });
      await insertEvent(tx, {
        userId,
        conversationId,
        generationId: "g3",
        costUsd: "0.12345678",
      });

      const total = await getUserConversationSpend(tx, {
        userId,
        conversationId,
      });

      expect(total).toBe("0.12495653");
    });
  });

  it("ignores rows from other conversations belonging to the same user", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "ucs-user-2");
      const convA = await seedConversation(tx, userId);
      const convB = await seedConversation(tx, userId);

      await insertEvent(tx, {
        userId,
        conversationId: convA,
        generationId: "ga1",
        costUsd: "1.00000000",
      });
      await insertEvent(tx, {
        userId,
        conversationId: convB,
        generationId: "gb1",
        costUsd: "0.50000000",
      });

      const totalA = await getUserConversationSpend(tx, {
        userId,
        conversationId: convA,
      });

      expect(totalA).toBe("1.00000000");
    });
  });

  it("ignores rows from other users in the same conversation lineage", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "ucs-user-3a");
      const otherUserId = await seedUser(tx, "ucs-user-3b");
      const conversationId = await seedConversation(tx, userId);
      const otherConversationId = await seedConversation(tx, otherUserId);

      await insertEvent(tx, {
        userId,
        conversationId,
        generationId: "gx1",
        costUsd: "0.10000000",
      });
      await insertEvent(tx, {
        userId: otherUserId,
        conversationId: otherConversationId,
        generationId: "gx2",
        costUsd: "9.99999999",
      });

      const total = await getUserConversationSpend(tx, {
        userId,
        conversationId,
      });

      expect(total).toBe("0.10000000");
    });
  });

  it("returns '0' when there are no rows", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "ucs-user-4");
      const conversationId = await seedConversation(tx, userId);

      const total = await getUserConversationSpend(tx, {
        userId,
        conversationId,
      });

      expect(total).toBe("0");
    });
  });

  it("skips NULL costs (Postgres SUM ignores NULL) and sums the rest", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "ucs-user-5");
      const conversationId = await seedConversation(tx, userId);

      await insertEvent(tx, {
        userId,
        conversationId,
        generationId: "gn1",
        costUsd: null,
      });
      await insertEvent(tx, {
        userId,
        conversationId,
        generationId: "gn2",
        costUsd: "0.00099975",
      });

      const total = await getUserConversationSpend(tx, {
        userId,
        conversationId,
      });

      expect(total).toBe("0.00099975");
    });
  });

  it("returns '0' when every row's cost is NULL (SUM of all-NULL is NULL → coerced)", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "ucs-user-6");
      const conversationId = await seedConversation(tx, userId);

      await insertEvent(tx, {
        userId,
        conversationId,
        generationId: "ga-null-1",
        costUsd: null,
      });
      await insertEvent(tx, {
        userId,
        conversationId,
        generationId: "ga-null-2",
        costUsd: null,
      });

      const total = await getUserConversationSpend(tx, {
        userId,
        conversationId,
      });

      expect(total).toBe("0");
    });
  });
});

describe("getUserTotalSpend", () => {
  it("sums rows across all conversations belonging to the user", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "uts-user-1");
      const convA = await seedConversation(tx, userId);
      const convB = await seedConversation(tx, userId);

      await insertEvent(tx, {
        userId,
        conversationId: convA,
        generationId: "ta1",
        costUsd: "0.10000000",
      });
      await insertEvent(tx, {
        userId,
        conversationId: convA,
        generationId: "ta2",
        costUsd: "0.20000000",
      });
      await insertEvent(tx, {
        userId,
        conversationId: convB,
        generationId: "tb1",
        costUsd: "0.30000000",
      });

      const total = await getUserTotalSpend(tx, { userId });

      expect(total).toBe("0.60000000");
    });
  });

  it("ignores rows from other users", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "uts-user-2a");
      const otherUserId = await seedUser(tx, "uts-user-2b");
      const conversationId = await seedConversation(tx, userId);
      const otherConversationId = await seedConversation(tx, otherUserId);

      await insertEvent(tx, {
        userId,
        conversationId,
        generationId: "ty1",
        costUsd: "0.25000000",
      });
      await insertEvent(tx, {
        userId: otherUserId,
        conversationId: otherConversationId,
        generationId: "ty2",
        costUsd: "7.77777777",
      });

      const total = await getUserTotalSpend(tx, { userId });

      expect(total).toBe("0.25000000");
    });
  });

  it("returns '0' when the user has no usage events", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "uts-user-3");

      const total = await getUserTotalSpend(tx, { userId });

      expect(total).toBe("0");
    });
  });

  it("preserves exact precision when summing many small values", async () => {
    await withTestTransaction(async (tx) => {
      const userId = await seedUser(tx, "uts-user-4");
      const conversationId = await seedConversation(tx, userId);

      for (let i = 0; i < 10; i++) {
        await insertEvent(tx, {
          userId,
          conversationId,
          generationId: `tp-${i}`,
          costUsd: "0.00000001",
        });
      }

      const total = await getUserTotalSpend(tx, { userId });

      expect(total).toBe("0.00000010");
    });
  });
});
