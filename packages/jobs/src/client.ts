import { Inngest } from "inngest";

import { env } from "@microlearn/env";

const APP_ID = "microlearn";

export const inngest = new Inngest({
  id: APP_ID,
  isDev: env.NODE_ENV === "development",
});
