import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";

export interface ToolContext {
  db: DbOrTx;
  actor: Actor;
}
