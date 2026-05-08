import { eventType } from "inngest";
import { z } from "zod/v4";

export const scheduledTaskDueEvent = eventType("scheduled_task/due", {
  schema: z.object({
    runId: z.uuid(),
    scheduledTaskId: z.uuid(),
    // ISO string — Date doesn't survive Inngest's JSON serialization.
    scheduledFor: z.string(),
  }),
});
