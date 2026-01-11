import { eq } from "drizzle-orm";

import { user, userProfile } from "@microlearn/db";
import type { DbOrTx } from "@microlearn/db/client";

import type { User } from "../types";

export interface UserWithProfile extends User {
  timezone: string | null;
}

export async function getUserById(
  db: DbOrTx,
  userId: string,
): Promise<UserWithProfile | null> {
  const result = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      timezone: userProfile.timezone,
    })
    .from(user)
    .leftJoin(userProfile, eq(user.id, userProfile.userId))
    .where(eq(user.id, userId))
    .limit(1);

  return result[0] ?? null;
}
