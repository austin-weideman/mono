import { serve } from "inngest/next";

import { runAssistant, startScheduled } from "@microlearn/conversation/jobs";
import { inngest } from "@microlearn/jobs";
import { dispatcher, executor } from "@microlearn/scheduler/inngest";

export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runAssistant, startScheduled, dispatcher, executor],
});
