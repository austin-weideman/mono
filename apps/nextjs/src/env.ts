import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";

import { env as sharedEnv } from "@microlearn/env";

const vercelEnv = createEnv({
  extends: [vercel()],
  server: {},
  client: {},
  experimental__runtimeEnv: {},
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});

export const env = {
  ...sharedEnv,
  ...vercelEnv,
};
