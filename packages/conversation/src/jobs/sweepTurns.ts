import type { InngestFunction } from "inngest";

import { db } from "@mono/db/client";
import { env } from "@mono/env";
import { inngest } from "@mono/jobs";

import { sweepTurns as sweep } from "../application/sweepTurns";

// Dev: every minute. Prod: every 15 minutes to stay well under Inngest Hobby's
// monthly execution limit; opening a stuck turn also resolves it right away.
const SWEEP_CRON =
  env.NODE_ENV === "development" ? "* * * * *" : "*/15 * * * *";

const sweepTurnsFn = inngest.createFunction(
  {
    id: "conversation-sweep-turns",
    retries: 0,
    triggers: [{ cron: SWEEP_CRON }],
  },
  async ({ step, logger }) => {
    return await step.run("sweep", () => sweep(db, new Date(), logger));
  },
);

export const sweepTurns: InngestFunction.Any = sweepTurnsFn;
