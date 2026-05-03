import { eventType } from "inngest";
import { z } from "zod/v4";

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
