import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";

import { env } from "@microlearn/env";

import * as schema from "./schema";

const pool = new Pool({ connectionString: env.POSTGRES_URL });

export type Db = NeonDatabase<typeof schema>;

export const db: Db = drizzle(pool, {
  schema,
  casing: "snake_case",
});

/**
 * Transaction type inferred from db.transaction callback.
 * Use this when passing transactions through function parameters.
 */
type TransactionFn = Parameters<typeof db.transaction>[0];
export type Transaction = Parameters<TransactionFn>[0];
