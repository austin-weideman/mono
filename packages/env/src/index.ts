import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

/**
 * Server-side environment variables.
 * All packages should import from here instead of using process.env directly.
 *
 * This ensures:
 * - Type-safe access to env vars
 * - Fail-fast validation at startup
 * - Single source of truth for all env var definitions
 */
export const env = createEnv({
  server: {
    // Database
    POSTGRES_URL: z.url(),
    DATABASE_URL_UNPOOLED: z.url().optional(),

    // Auth
    AUTH_SECRET: z.string().min(1).optional(),
    AUTH_GOOGLE_ID: z.string().min(1).optional(),
    AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
    AUTH_BASE_URL: z.url().optional(),

    // AI Gateway (primary - access all providers with one key)
    AI_GATEWAY_API_KEY: z.string().min(1),

    // Direct provider keys (optional - for fallback or specific use cases)
    OPENAI_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),

    // Environment
    NODE_ENV: z
      .enum(["development", "staging", "test", "production"])
      .default("development"),

    // Note: TZ is reserved by Vercel and cannot be validated
    // Vercel serverless runs in UTC by default
  },
  runtimeEnv: process.env,
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});

export type Env = typeof env;
