import type { InngestFunction } from "inngest";

import { db } from "@mono/db/client";
import { InternalServerError } from "@mono/errors";
import { inngest } from "@mono/jobs";
import { scheduledTaskDueEvent } from "@mono/jobs/events/scheduler";

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
      const original = event.data.event as { data: { runId: string } };
      await failRun(db, {
        runId: original.data.runId,
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
