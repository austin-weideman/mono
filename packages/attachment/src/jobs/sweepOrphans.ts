import type { InngestFunction } from "inngest";

import { systemActor } from "@mono/core-types";
import { db } from "@mono/db/client";
import { inngest } from "@mono/jobs";

import { sweepOrphanAttachments } from "../application/sweepOrphanAttachments";

const SYSTEM_SERVICE = "attachment";

const sweepOrphansFn = inngest.createFunction(
  {
    id: "attachment-sweep-orphans",
    retries: 3,
    concurrency: { limit: 1 },
    // Daily at 03:00 UTC
    triggers: [{ cron: "0 3 * * *" }],
  },
  async ({ step }) => {
    return await step.run("sweep", () =>
      sweepOrphanAttachments(db, systemActor(SYSTEM_SERVICE), new Date()),
    );
  },
);

export const sweepOrphans: InngestFunction.Any = sweepOrphansFn;
