import { describe, expect, it } from "vitest";

import { user } from "@microlearn/db";
import type { Transaction } from "@microlearn/db/client";
import { withTestTransaction } from "@microlearn/testing";

import { insertConversation } from "./conversation.mutations";
import {
  getConversationById,
  listConversationsForUser,
} from "./conversation.queries";

/**
 * Creates a test user in the transaction.
 * Required because conversations have a foreign key to users.
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

        // Insert test conversations
        await insertConversation(tx, { userId, title: "First Chat" });
        await insertConversation(tx, { userId, title: "Second Chat" });

        // Insert conversation for different user (should not be returned)
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

