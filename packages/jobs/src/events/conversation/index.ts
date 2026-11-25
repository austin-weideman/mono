import { eventType } from "inngest";
import { z } from "zod/v4";

// Runs one assistant-agent turn. Everything else about the turn lives on its
// chat_turn row.
export const conversationAssistantTurnRequestedEvent = eventType(
  "conversation/assistant-turn.requested",
  {
    schema: z.object({
      turnId: z.uuid(),
      conversationId: z.uuid(),
      userId: z.string(),
    }),
  },
);

// Runs one scientist-agent turn for the campaign that owns the conversation.
export const conversationScientistTurnRequestedEvent = eventType(
  "conversation/scientist-turn.requested",
  {
    schema: z.object({
      turnId: z.uuid(),
      conversationId: z.uuid(),
      userId: z.string(),
    }),
  },
);

// Conversation started by the server
export const conversationScheduledStartEvent = eventType(
  "conversation/scheduled.start",
  {
    schema: z.object({
      userId: z.string(),
      prompt: z.string().min(1),
      gatewayModelId: z.string(),
    }),
  },
);
