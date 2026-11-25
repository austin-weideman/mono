import type { InngestFunction } from "inngest";

import { createAssistantAgent } from "@mono/agent";
import { userActor } from "@mono/core-types";
import { db } from "@mono/db/client";
import { conversationAssistantTurnRequestedEvent } from "@mono/jobs/events/conversation";

import { createTurnFunction } from "./createTurnFunction";

export const runAssistantTurn: InngestFunction.Any = createTurnFunction({
  id: "conversation-run-assistant-turn",
  event: conversationAssistantTurnRequestedEvent,
  createAgent: (turn) =>
    Promise.resolve(
      createAssistantAgent({
        gatewayModelId: turn.gatewayModelId,
        context: { db, actor: userActor(turn.userId) },
        userId: turn.userId,
      }),
    ),
});
