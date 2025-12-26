import { db } from "@microlearn/db/client";
import type { Transaction } from "@microlearn/db/client";

/**
 * Executes a test function within a database transaction that is always rolled back.
 *
 * This ensures test data never persists to the database.
 */
export async function withTestTransaction<T>(
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  let result!: T;
  let testError: unknown = null;

  try {
    await db.transaction(async (tx) => {
      try {
        result = await fn(tx);
      } catch (e) {
        testError = e;
      }
      // Always rollback
      tx.rollback();
    });
  } catch (e) {
    // Only swallow the rollback error (Drizzle throws DrizzleError with message "Rollback")
    const isRollbackError =
      e instanceof Error &&
      (e.name === "TransactionRollbackError" ||
        (e.name === "DrizzleError" && e.message === "Rollback"));

    if (!isRollbackError) {
      throw e;
    }
  }

  // Re-throw any test error after rollback completed
  if (testError !== null) {
    if (testError instanceof Error) {
      throw testError;
    }
    throw new Error("Test threw a non-Error value");
  }

  return result;
}

