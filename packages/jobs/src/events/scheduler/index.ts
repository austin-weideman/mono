import { eventType } from "inngest";
import { z } from "zod/v4";

// Fired by the scheduler dispatcher when a scheduled_task_run is ready to execute.
// Idempotency: Inngest event id is composed at emit time as
// `${scheduledTaskId}:${scheduledFor.toISOString()}`.
export const scheduledTaskDueEvent = eventType("scheduled_task/due", {
  schema: z.object({
    runId: z.uuid(),
    scheduledTaskId: z.uuid(),
    // ISO-8601 string. Date objects don't survive Inngest's JSON serialization.
    scheduledFor: z.string(),
  }),
});
