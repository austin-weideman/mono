import { eventType } from "inngest";
import { z } from "zod/v4";

// Conversation started by the client
export const conversationRunAssistantEvent = eventType(
  "conversation/run-assistant",
  {
    schema: z.object({
      conversationId: z.uuid(),
      userId: z.string(),
      streamId: z.uuid(),
      gatewayModelId: z.string(),
    }),
  },
);

// Scientist agent turn for a campaign (the campaign IS this conversation).
// Mirrors run-assistant; the chat route emits this instead when the
// conversation has an associated campaign.
export const conversationRunScientistEvent = eventType(
  "conversation/run-scientist",
  {
    schema: z.object({
      conversationId: z.uuid(),
      campaignId: z.uuid(),
      userId: z.string(),
      streamId: z.uuid(),
      gatewayModelId: z.string(),
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
