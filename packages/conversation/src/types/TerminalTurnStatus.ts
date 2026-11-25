import type { ChatTurnStatus } from "./ChatTurnStatus";

export type TerminalTurnStatus = Extract<
  ChatTurnStatus,
  "completed" | "failed" | "cancelled"
>;
