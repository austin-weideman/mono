import type { InngestFunction } from "inngest";

import { createTurnFunction } from "@mono/conversation";
import { db } from "@mono/db/client";
import { conversationScientistTurnRequestedEvent } from "@mono/jobs/events/conversation";

import { scientistTurnAgent } from "../agent/scientistTurnAgent";

export const runScientistTurn: InngestFunction.Any = createTurnFunction({
  id: "experiment-run-scientist-turn",
  event: conversationScientistTurnRequestedEvent,
  createAgent: scientistTurnAgent(db),
});
