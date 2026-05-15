import { serve } from "inngest/next";

import { sweepOrphans } from "@mono/attachment/jobs";
import { runAssistant, startScheduled } from "@mono/conversation/jobs";
import { inngest } from "@mono/jobs";
import { dispatcher, executor } from "@mono/scheduler/inngest";

export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runAssistant, startScheduled, dispatcher, executor, sweepOrphans],
});
