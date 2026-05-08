import type { InngestFunction } from "inngest";

import { db } from "@microlearn/db/client";
import { env } from "@microlearn/env";
import { inngest } from "@microlearn/jobs";

import { dispatchDue } from "../application/dispatchDue";
import { emitPendingRuns } from "../application/emitPendingRuns";

// Dev: every minute for fast feedback. Prod: hourly to stay well under
// Inngest Hobby's 50K monthly executions.
const DISPATCHER_CRON =
  env.NODE_ENV === "development" ? "* * * * *" : "0 * * * *";

const dispatcherFn = inngest.createFunction(
  {
    id: "scheduler-dispatcher",
    retries: 3,
    triggers: [{ cron: DISPATCHER_CRON }],
  },
  async ({ step }) => {
    const dispatchResult = await step.run("dispatch", () =>
      dispatchDue(db, new Date()),
    );

    const emitResult = await step.run("emit", () =>
      emitPendingRuns(db, inngest, new Date()),
    );

    return { dispatch: dispatchResult, emit: emitResult };
  },
);

export const dispatcher: InngestFunction.Any = dispatcherFn;
