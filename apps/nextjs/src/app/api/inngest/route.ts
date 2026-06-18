import { serve } from "inngest/next";

import { sweepOrphans } from "@mono/attachment/jobs";
import { runAssistant, startScheduled } from "@mono/conversation/jobs";
import { runScientist } from "@mono/experiment/jobs";
import { inngest } from "@mono/jobs";
import { dispatcher, executor } from "@mono/scheduler/inngest";

export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    runAssistant,
    runScientist,
    startScheduled,
    dispatcher,
    executor,
    sweepOrphans,
  ],
});
