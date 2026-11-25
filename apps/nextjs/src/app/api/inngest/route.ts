import { serve } from "inngest/next";

import { sweepOrphans } from "@mono/attachment/jobs";
import {
  runAssistantTurn,
  startScheduled,
  sweepTurns,
} from "@mono/conversation/jobs";
import { runScientistTurn } from "@mono/experiment/jobs";
import { inngest } from "@mono/jobs";
import { dispatcher, executor } from "@mono/scheduler/inngest";

export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    runAssistantTurn,
    runScientistTurn,
    startScheduled,
    sweepTurns,
    dispatcher,
    executor,
    sweepOrphans,
  ],
});
