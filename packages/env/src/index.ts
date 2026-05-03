import { z } from "zod/v4";

/**
 * All packages should import from here instead of using process.env
 *
 * Ensures type-safe access, fail-fast validation, and single source of truth
 */
const envSchema = z.object({
  POSTGRES_URL: z.url(),
  DATABASE_URL_UNPOOLED: z.url().optional(),

  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  AUTH_BASE_URL: z.url(),

  AI_GATEWAY_API_KEY: z.string().min(1),

  EXA_API_KEY: z.string().min(1),

  INNGEST_EVENT_KEY: z.string().min(1).optional(),
  INNGEST_SIGNING_KEY: z.string().min(1).optional(),

  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  NODE_ENV: z
    .enum(["development", "staging", "test", "production"])
    .default("development"),

  // Note: TZ is reserved by Vercel and cannot be validated. Vercel serverless runs in UTC by default
});

const skipValidation =
  !!process.env.CI || process.env.npm_lifecycle_event === "lint";

export const env = skipValidation
  ? (process.env as unknown as z.infer<typeof envSchema>)
  : envSchema.parse(process.env);

export type Env = typeof env;
