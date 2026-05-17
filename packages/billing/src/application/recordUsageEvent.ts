import type { SystemActor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";

import type { RecordUsageEventInput } from "../types";
import { insertUsageEvent } from "../persistence/usageEvent.mutations";

export async function recordUsageEvent(
  db: DbOrTx,
  _actor: SystemActor,
  input: RecordUsageEventInput,
): Promise<void> {
  await insertUsageEvent(db, input);
}
