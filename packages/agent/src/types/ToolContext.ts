import type { Actor } from "@microlearn/core-types";
import type { DbOrTx } from "@microlearn/db/client";

export interface ToolContext {
  db: DbOrTx;
  actor: Actor;
}
