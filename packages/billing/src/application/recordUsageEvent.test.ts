import { eq } from "drizzle-orm";
import { assert, describe, expect, it } from "vitest";

import type { SystemActor } from "@mono/core-types";
import type { Transaction } from "@mono/db/client";
import { systemActor } from "@mono/core-types";
import { conversation, usageEvent, user } from "@mono/db";
import { withTestTransaction } from "@mono/testing";

import { recordUsageEvent } from "./recordUsageEvent";

const SYS: SystemActor = systemActor("test");

async function seedUserAndConversation(
  tx: Transaction,
  id: string,
): Promise<{ userId: string; conversationId: string }> {
  await tx.insert(user).values({
    id,
    name: `Test ${id}`,
    email: `${id}@test.com`,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [conv] = await tx
    .insert(conversation)
    .values({ userId: id, title: "test" })
    .returning({ id: conversation.id });
  assert(conv, "failed to insert conversation");
  return { userId: id, conversationId: conv.id };
}

describe("recordUsageEvent", () => {
  it("inserts a usage event with the cost string preserved exactly", async () => {
    await withTestTransaction(async (tx) => {
      const { userId, conversationId } = await seedUserAndConversation(
        tx,
        "rue-user-1",
      );
      const generationId = "gen-rue-1";

      await recordUsageEvent(tx, SYS, {
        userId,
        conversationId,
        generationId,
        gatewayModelId: "anthropic/claude-sonnet-4.6",
        costUsd: "0.00099975",
      });

      const [row] = await tx
        .select()
        .from(usageEvent)
        .where(eq(usageEvent.generationId, generationId));

      assert(row, "expected usage_event row to exist");
      expect(row.userId).toBe(userId);
      expect(row.conversationId).toBe(conversationId);
      expect(row.gatewayModelId).toBe("anthropic/claude-sonnet-4.6");
      expect(row.costUsd).toBe("0.00099975");
    });
  });

  it("inserts a usage event with NULL cost when costUsd is null", async () => {
    await withTestTransaction(async (tx) => {
      const { userId, conversationId } = await seedUserAndConversation(
        tx,
        "rue-user-2",
      );
      const generationId = "gen-rue-2";

      await recordUsageEvent(tx, SYS, {
        userId,
        conversationId,
        generationId,
        gatewayModelId: "openai/gpt-5",
        costUsd: null,
      });

      const [row] = await tx
        .select()
        .from(usageEvent)
        .where(eq(usageEvent.generationId, generationId));

      assert(row, "expected usage_event row to exist");
      expect(row.costUsd).toBeNull();
    });
  });

  it("is idempotent on generationId — second call is a no-op, no throw", async () => {
    await withTestTransaction(async (tx) => {
      const { userId, conversationId } = await seedUserAndConversation(
        tx,
        "rue-user-3",
      );
      const generationId = "gen-rue-3";

      const input = {
        userId,
        conversationId,
        generationId,
        gatewayModelId: "anthropic/claude-sonnet-4.6",
        costUsd: "0.00050000",
      };

      await recordUsageEvent(tx, SYS, input);
      await expect(recordUsageEvent(tx, SYS, input)).resolves.toBeUndefined();

      const rows = await tx
        .select()
        .from(usageEvent)
        .where(eq(usageEvent.generationId, generationId));

      expect(rows).toHaveLength(1);
      const [row] = rows;
      assert(row);
      expect(row.costUsd).toBe("0.00050000");
    });
  });
});
