import { inngest } from "@mono/jobs";
import {
  conversationAssistantTurnRequestedEvent,
  conversationScientistTurnRequestedEvent,
} from "@mono/jobs/events/conversation";

import type { ChatTurn } from "../types/ChatTurn";
import type { ChatTurnAgent } from "../types/ChatTurnAgent";

const TURN_EVENT_BY_AGENT = {
  assistant: conversationAssistantTurnRequestedEvent,
  scientist: conversationScientistTurnRequestedEvent,
} as const satisfies Record<ChatTurnAgent, unknown>;

// Safe to call more than once: Inngest drops repeats of the same event ID.
export async function dispatchTurn(
  turn: Pick<ChatTurn, "id" | "agent" | "conversationId" | "userId">,
): Promise<void> {
  const event = TURN_EVENT_BY_AGENT[turn.agent];
  await inngest.send(
    event.create(
      {
        turnId: turn.id,
        conversationId: turn.conversationId,
        userId: turn.userId,
      },
      { id: turn.id },
    ),
  );
}
