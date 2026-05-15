import { z } from "zod/v4";

import { env as sharedEnv } from "@mono/env";

const vercelSchema = z.object({
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
});

const skipValidation =
  !!process.env.CI || process.env.npm_lifecycle_event === "lint";

const vercelEnv = skipValidation
  ? (process.env as unknown as z.infer<typeof vercelSchema>)
  : vercelSchema.parse(process.env);

if (
  !skipValidation &&
  vercelEnv.VERCEL_ENV &&
  !vercelEnv.VERCEL_PROJECT_PRODUCTION_URL
) {
  throw new Error(
    "VERCEL_PROJECT_PRODUCTION_URL must be set when running on Vercel",
  );
}

export const env = {
  ...sharedEnv,
  ...vercelEnv,
};
