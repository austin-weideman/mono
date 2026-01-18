import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { conversation, user } from "@microlearn/db";
import type { Transaction } from "@microlearn/db/client";
import { withTestTransaction } from "@microlearn/testing";

import { insertConversation } from "./conversation.mutations";
import {
  getConversationById,
  listConversationsForUser,
} from "./conversation.queries";

/**
 * Creates a test user in the transaction.
 * Required because conversations have a foreign key to users
 */
async function createTestUser(
  tx: Transaction,
  id: string,
): Promise<string> {
  await tx.insert(user).values({
    id,
    name: `Test User ${id}`,
    email: `${id}@test.com`,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

describe("conversation.queries", () => {
  describe("listConversationsForUser", () => {
    it("returns empty array when user has no conversations", async () => {
      await withTestTransaction(async (tx) => {
        const result = await listConversationsForUser(tx, "non-existent-user", { limit: 20 });
        expect(result).toEqual([]);
      });
    });

    it("returns conversations for the specified user", async () => {
      await withTestTransaction(async (tx) => {
        const userId = await createTestUser(tx, "test-user-123");
        const otherUserId = await createTestUser(tx, "other-user");

        await insertConversation(tx, { userId, title: "First Chat" });
        await insertConversation(tx, { userId, title: "Second Chat" });

        await insertConversation(tx, {
          userId: otherUserId,
          title: "Other User Chat",
        });

        const result = await listConversationsForUser(tx, userId, { limit: 20 });

        expect(result).toHaveLength(2);
        expect(result.map((c) => c.title)).toContain("First Chat");
        expect(result.map((c) => c.title)).toContain("Second Chat");
      });
    });

    it("respects the limit parameter", async () => {
      await withTestTransaction(async (tx) => {
        const userId = await createTestUser(tx, "test-user-limit");

        await insertConversation(tx, { userId, title: "Chat 1" });
        await insertConversation(tx, { userId, title: "Chat 2" });
        await insertConversation(tx, { userId, title: "Chat 3" });

        const result = await listConversationsForUser(tx, userId, { limit: 2 });

        expect(result).toHaveLength(3);
      });
    });

    it("returns conversations ordered by updatedAt descending", async () => {
      await withTestTransaction(async (tx) => {
        const userId = await createTestUser(tx, "test-user-order");

        const older = await insertConversation(tx, { userId, title: "Older" });
        const newer = await insertConversation(tx, { userId, title: "Newer" });

        await tx
          .update(conversation)
          .set({ updatedAt: new Date("2024-01-01T10:00:00Z") })
          .where(eq(conversation.id, older.id));

        await tx
          .update(conversation)
          .set({ updatedAt: new Date("2024-01-02T10:00:00Z") })
          .where(eq(conversation.id, newer.id));

        const result = await listConversationsForUser(tx, userId, { limit: 10 });

        expect(result[0]?.id).toBe(newer.id);
        expect(result[1]?.id).toBe(older.id);
      });
    });

    it("paginates using cursor", async () => {
      await withTestTransaction(async (tx) => {
        const userId = await createTestUser(tx, "test-user-cursor");

        const first = await insertConversation(tx, { userId, title: "First" });
        const second = await insertConversation(tx, { userId, title: "Second" });
        const third = await insertConversation(tx, { userId, title: "Third" });

        const firstTime = new Date("2024-01-01T10:00:00Z");
        const secondTime = new Date("2024-01-02T10:00:00Z");
        const thirdTime = new Date("2024-01-03T10:00:00Z");

        await tx
          .update(conversation)
          .set({ updatedAt: firstTime })
          .where(eq(conversation.id, first.id));

        await tx
          .update(conversation)
          .set({ updatedAt: secondTime })
          .where(eq(conversation.id, second.id));

        await tx
          .update(conversation)
          .set({ updatedAt: thirdTime })
          .where(eq(conversation.id, third.id));

        const firstPage = await listConversationsForUser(tx, userId, { limit: 1 });
        expect(firstPage).toHaveLength(2);
        expect(firstPage[0]?.id).toBe(third.id);

        const secondPage = await listConversationsForUser(tx, userId, {
          limit: 1,
          cursor: { id: third.id, updatedAt: thirdTime },
        });
        expect(secondPage).toHaveLength(2);
        expect(secondPage[0]?.id).toBe(second.id);

        const thirdPage = await listConversationsForUser(tx, userId, {
          limit: 1,
          cursor: { id: second.id, updatedAt: secondTime },
        });
        expect(thirdPage).toHaveLength(1);
        expect(thirdPage[0]?.id).toBe(first.id);
      });
    });

    it("excludes archived conversations", async () => {
      await withTestTransaction(async (tx) => {
        const userId = await createTestUser(tx, "test-user-archive");

        await insertConversation(tx, { userId, title: "Active" });
        const archived = await insertConversation(tx, { userId, title: "Archived" });

        await tx
          .update(conversation)
          .set({ archivedAt: new Date() })
          .where(eq(conversation.id, archived.id));

        const result = await listConversationsForUser(tx, userId, { limit: 10 });

        expect(result).toHaveLength(1);
        expect(result[0]?.title).toBe("Active");
      });
    });

    it("uses id as tie-breaker when updatedAt is identical (compound cursor)", async () => {
      await withTestTransaction(async (tx) => {
        const userId = await createTestUser(tx, "test-user-tiebreaker");
        const sameTime = new Date("2024-06-15T12:00:00Z");

        const ids = [
          "aaaaaaaa-0000-0000-0000-000000000001",
          "bbbbbbbb-0000-0000-0000-000000000002",
          "cccccccc-0000-0000-0000-000000000003",
          "dddddddd-0000-0000-0000-000000000004",
          "eeeeeeee-0000-0000-0000-000000000005",
        ];

        for (const id of ids) {
          await insertConversation(tx, { id, userId, title: `Chat ${id.slice(0, 8)}` });
          await tx
            .update(conversation)
            .set({ updatedAt: sameTime })
            .where(eq(conversation.id, id));
        }

        const result = await listConversationsForUser(tx, userId, { limit: 10 });

        expect(result).toHaveLength(5);
        expect(result[0]?.id).toBe(ids[4]);
        expect(result[1]?.id).toBe(ids[3]);
        expect(result[2]?.id).toBe(ids[2]);
        expect(result[3]?.id).toBe(ids[1]);
        expect(result[4]?.id).toBe(ids[0]);

        const page1 = await listConversationsForUser(tx, userId, { limit: 2 });
        expect(page1).toHaveLength(3);
        expect(page1[0]?.id).toBe(ids[4]);
        expect(page1[1]?.id).toBe(ids[3]);

        const cursorId1 = ids[3];
        if (!cursorId1) throw new Error("Test setup error");

        const page2 = await listConversationsForUser(tx, userId, {
          limit: 2,
          cursor: { id: cursorId1, updatedAt: sameTime },
        });
        expect(page2).toHaveLength(3);
        expect(page2[0]?.id).toBe(ids[2]);
        expect(page2[1]?.id).toBe(ids[1]);

        const cursorId2 = ids[1];
        if (!cursorId2) throw new Error("Test setup error");

        const page3 = await listConversationsForUser(tx, userId, {
          limit: 2,
          cursor: { id: cursorId2, updatedAt: sameTime },
        });
        expect(page3).toHaveLength(1);
        expect(page3[0]?.id).toBe(ids[0]);
      });
    });

    it("paginates correctly through larger dataset", async () => {
      await withTestTransaction(async (tx) => {
        const userId = await createTestUser(tx, "test-user-large");
        const baseTime = new Date("2024-01-01T00:00:00Z");
        const conversationIds: string[] = [];

        for (let i = 0; i < 25; i++) {
          const conv = await insertConversation(tx, {
            userId,
            title: `Conversation ${i.toString().padStart(2, "0")}`,
          });
          conversationIds.push(conv.id);

          await tx
            .update(conversation)
            .set({ updatedAt: new Date(baseTime.getTime() + i * 60000) })
            .where(eq(conversation.id, conv.id));
        }

        const expectedOrder = [...conversationIds].reverse();

        let allFetched: string[] = [];
        let cursor: { id: string; updatedAt: Date } | undefined;
        let pageCount = 0;

        while (pageCount < 10) {
          const page = await listConversationsForUser(tx, userId, {
            limit: 5,
            cursor,
          });

          if (page.length === 0) break;

          const hasMore = page.length > 5;
          const items = hasMore ? page.slice(0, 5) : page;

          allFetched = [...allFetched, ...items.map((c) => c.id)];

          if (!hasMore) break;

          const lastItem = items[items.length - 1];
          cursor = lastItem ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : undefined;
          pageCount++;
        }

        expect(allFetched).toHaveLength(25);
        expect(allFetched).toEqual(expectedOrder);
      });
    });

  });

  describe("getConversationById", () => {
    it("returns null when conversation does not exist", async () => {
      await withTestTransaction(async (tx) => {
        const result = await getConversationById(
          tx,
          "00000000-0000-0000-0000-000000000000",
        );
        expect(result).toBeNull();
      });
    });

    it("returns the conversation when it exists", async () => {
      await withTestTransaction(async (tx) => {
        const userId = await createTestUser(tx, "test-user-789");

        const created = await insertConversation(tx, {
          userId,
          title: "Test Conversation",
        });

        const result = await getConversationById(tx, created.id);

        expect(result).not.toBeNull();
        expect(result?.id).toBe(created.id);
        expect(result?.title).toBe("Test Conversation");
      });
    });
  });
});

