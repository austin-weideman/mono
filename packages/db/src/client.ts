import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { env } from "@mono/env";

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

/**
 * Union type for functions that accept either the main db or a transaction.
 * Use this as the parameter type for database operations that need to work
 * in both standalone and transactional contexts.
 */
export type DbOrTx = Db | Transaction;
