import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

if (!process.env.POSTGRES_URL) {
  throw new Error(
    "POSTGRES_URL environment variable is required for database connection",
  );
}

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export type Db = NeonDatabase<typeof schema>;

export const db: Db = drizzle(pool, {
  schema,
  casing: "snake_case",
});
