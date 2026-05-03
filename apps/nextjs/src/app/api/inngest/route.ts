import { serve } from "inngest/next";

import { runAssistant } from "@microlearn/conversation/jobs";
import { inngest } from "@microlearn/jobs";

export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runAssistant],
});
