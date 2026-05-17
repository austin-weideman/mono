import type { DbOrTx } from "@mono/db/client";
import { usageEvent } from "@mono/db";

import type { RecordUsageEventInput } from "../types";

export async function insertUsageEvent(
  db: DbOrTx,
  input: RecordUsageEventInput,
): Promise<void> {
  await db
    .insert(usageEvent)
    .values({
      userId: input.userId,
      conversationId: input.conversationId,
      generationId: input.generationId,
      gatewayModelId: input.gatewayModelId,
      costUsd: input.costUsd,
    })
    .onConflictDoNothing({ target: usageEvent.generationId });
}
