import type { UIMessage } from "ai";

import type { Message as DbMessage } from "@microlearn/db";

export interface Message extends Omit<DbMessage, "parts"> {
  parts: UIMessage["parts"];
}
