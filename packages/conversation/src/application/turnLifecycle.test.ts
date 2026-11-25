import { describe, expect, it } from "vitest";

import type { Transaction } from "@mono/db/client";
import { systemActor } from "@mono/core-types";
import { user } from "@mono/db";
import { ConflictError } from "@mono/errors";
import { withTestTransaction } from "@mono/testing";

import { endTurn, markTurnStreaming } from "../persistence/chat-turn.mutations";
import { insertConversation } from "../persistence/conversation.mutations";
import { listMessagesForConversation } from "../persistence/message.queries";
import { retryTurn } from "./retryTurn";
import { startTurn } from "./startTurn";

const actor = systemActor("test");

async function setup(tx: Transaction): Promise<string> {
  const userId = crypto.randomUUID();
  await tx.insert(user).values({
    id: userId,
    name: "Turn Test",
    email: `${userId}@test.com`,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const conversation = await insertConversation(tx, { userId });
  return conversation.id;
}

function start(
  tx: Transaction,
  conversationId: string,
  turnId: string = crypto.randomUUID(),
) {
  return startTurn(tx, actor, {
    turnId,
    conversationId,
    agent: "assistant",
    gatewayModelId: "test/model",
    userMessage: {
      id: crypto.randomUUID(),
      parts: [{ type: "text", text: "hi" }],
    },
  });
}

describe("turn lifecycle", () => {
  it("allows one active turn per conversation and frees it when the turn ends", async () => {
    await withTestTransaction(async (tx) => {
      const conversationId = await setup(tx);
      const first = await start(tx, conversationId);
      expect(first.created).toBe(true);
      expect((await start(tx, conversationId, first.turn.id)).created).toBe(
        false,
      );

      await expect(
        tx.transaction((savepoint) => start(savepoint, conversationId)),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(
        await endTurn(tx, first.turn.id, ["streaming"], {
          status: "completed",
        }),
      ).toBeNull();
      await markTurnStreaming(tx, first.turn.id);
      expect(
        await endTurn(tx, first.turn.id, ["streaming"], {
          status: "completed",
        }),
      ).not.toBeNull();

      expect((await start(tx, conversationId)).created).toBe(true);
    });
  });

  it("retries only the latest failed turn, replacing its reply", async () => {
    await withTestTransaction(async (tx) => {
      const conversationId = await setup(tx);
      const { turn } = await start(tx, conversationId);

      await expect(
        tx.transaction((savepoint) =>
          retryTurn(savepoint, actor, {
            turnId: crypto.randomUUID(),
            retryOfTurnId: turn.id,
            gatewayModelId: "test/model",
          }),
        ),
      ).rejects.toBeInstanceOf(ConflictError);

      await endTurn(tx, turn.id, ["queued"], {
        status: "failed",
        failureKind: "agent_error",
        failureReason: "boom",
      });
      const retried = await retryTurn(tx, actor, {
        turnId: crypto.randomUUID(),
        retryOfTurnId: turn.id,
        gatewayModelId: "test/model",
      });

      expect(retried.turn.userMessageId).toBe(turn.userMessageId);
      const messageIds = (
        await listMessagesForConversation(tx, conversationId)
      ).map((message) => message.id);
      expect(messageIds).toEqual([
        turn.userMessageId,
        retried.turn.assistantMessageId,
      ]);
    });
  });
});
