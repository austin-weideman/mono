import type { InngestFunction } from "inngest";

import { db } from "@microlearn/db/client";
import { InternalServerError } from "@microlearn/errors";
import { inngest } from "@microlearn/jobs";
import { scheduledTaskDueEvent } from "@microlearn/jobs/events/scheduler";

import { completeRun, failRun } from "../application/completeRun";
import { loadAndStartRun } from "../application/loadAndStartRun";
import { getTaskHandler } from "../handlers/registry";

const EXECUTOR_RETRIES = 3;

const executorFn = inngest.createFunction(
  {
    id: "scheduler-executor",
    retries: EXECUTOR_RETRIES,
    triggers: [{ event: scheduledTaskDueEvent }],
    onFailure: async ({ event, error }) => {
      // event.data.event is the original `scheduled_task/due` payload. The
      // SDK types `event` loosely on the failure handler, so narrow it.
      const original = event.data.event as { data: { runId: string } };
      const runId = original.data.runId;
      await failRun(db, {
        runId,
        now: new Date(),
        error: { name: error.name, message: error.message },
      });
    },
  },
  async ({ event, step }) => {
    const { runId } = event.data;

    const loaded = await step.run("load", () => loadAndStartRun(db, runId));

    await step.run("handle", async () => {
      const handler = getTaskHandler(loaded.taskType);
      if (!handler) {
        throw new InternalServerError(
          `No handler registered for task type: ${loaded.taskType}`,
        );
      }
      // Each handler defines its own payload schema; the registry stores
      // them as TaskHandler<any>, so the parse result is `any`. Funnel
      // through `unknown` and let the handler's signature re-narrow.
      const parsed: unknown = handler.payloadSchema.parse(loaded.payload);
      await handler.execute(
        {
          db,
          actor: loaded.actor,
          runId,
          scheduledFor: new Date(loaded.scheduledForIso),
        },
        parsed,
      );
    });

    await step.run("complete", () =>
      completeRun(db, { runId, now: new Date() }),
    );
  },
);

export const executor: InngestFunction.Any = executorFn;
