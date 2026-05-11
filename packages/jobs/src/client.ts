import { Inngest } from "inngest";

import { env } from "@mono/env";

const APP_ID = "mono";

export const inngest = new Inngest({
  id: APP_ID,
  isDev: env.NODE_ENV === "development",
});
