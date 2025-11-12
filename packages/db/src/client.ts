import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

if (!process.env.POSTGRES_URL) {
  throw new Error(
    "POSTGRES_URL environment variable is required for database connection",
  );
}

const sql = neon(process.env.POSTGRES_URL);

export type Db = NeonHttpDatabase<typeof schema>;

export const db: Db = drizzle(sql, {
  schema,
  casing: "snake_case",
});
