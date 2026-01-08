import { eq } from "drizzle-orm";

import { user } from "@microlearn/db";
import type { DbOrTx } from "@microlearn/db/client";

import type { User } from "../types";

export async function getUserById(
  db: DbOrTx,
  userId: string,
): Promise<User | null> {
  const result = await db.select().from(user).where(eq(user.id, userId));

  return result[0] ?? null;
}
