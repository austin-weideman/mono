import type { DbOrTx } from "@mono/db/client";
import { userProfile } from "@mono/db";
import { InternalServerError } from "@mono/errors";

export async function upsertUserProfile(
  db: DbOrTx,
  userId: string,
  data: { timezone: string },
): Promise<void> {
  const result = await db
    .insert(userProfile)
    .values({
      userId,
      timezone: data.timezone,
    })
    .onConflictDoUpdate({
      target: userProfile.userId,
      set: {
        timezone: data.timezone,
        updatedAt: new Date(),
      },
    })
    .returning({ userId: userProfile.userId });

  if (result.length === 0) {
    throw new InternalServerError(`Failed to upsert user profile: ${userId}`);
  }
}
