import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

if (!process.env.POSTGRES_URL) {
  throw new Error(
    "POSTGRES_URL environment variable is required for database connection",
  );
}

const sql = neon(process.env.POSTGRES_URL);

export const db = drizzle(sql, {
  schema,
  casing: "snake_case",
});
