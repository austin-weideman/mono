import type { UIMessage } from "ai";

import type { Message as DbMessage } from "@mono/db";

export interface Message extends Omit<DbMessage, "parts"> {
  parts: UIMessage["parts"];
}
