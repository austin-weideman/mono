import type { Config } from "drizzle-kit";

// Use direct (non-pooled) connection for migrations
if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error("DATABASE_URL_UNPOOLED environment variable required");
}

const migrationUrl = process.env.DATABASE_URL_UNPOOLED;

export default {
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: { url: migrationUrl },
  casing: "snake_case",
} satisfies Config;
