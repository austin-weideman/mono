import { and, eq, sum } from "drizzle-orm";

import type { DbOrTx } from "@mono/db/client";
import { usageEvent } from "@mono/db";

export async function getUserConversationSpend(
  db: DbOrTx,
  args: { userId: string; conversationId: string },
): Promise<string> {
  const [row] = await db
    .select({ totalUsd: sum(usageEvent.costUsd) })
    .from(usageEvent)
    .where(
      and(
        eq(usageEvent.userId, args.userId),
        eq(usageEvent.conversationId, args.conversationId),
      ),
    );
  return row?.totalUsd ?? "0";
}

export async function getUserTotalSpend(
  db: DbOrTx,
  args: { userId: string },
): Promise<string> {
  const [row] = await db
    .select({ totalUsd: sum(usageEvent.costUsd) })
    .from(usageEvent)
    .where(eq(usageEvent.userId, args.userId));
  return row?.totalUsd ?? "0";
}
