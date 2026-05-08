import type { InngestFunction } from "inngest";

import { db } from "@microlearn/db/client";
import { inngest } from "@microlearn/jobs";

import { dispatchDue } from "../application/dispatchDue";
import { emitPendingRuns } from "../application/emitPendingRuns";

const dispatcherFn = inngest.createFunction(
  {
    id: "scheduler-dispatcher",
    retries: 3,
    triggers: [{ cron: "* * * * *" }],
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
