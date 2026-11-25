export type TurnStopReason = "cancelled" | "gone";

export type TurnStepOutcome =
  | { kind: "tools"; pendingToolCallIds: string[]; stepLimitReached: boolean }
  | { kind: "done" }
  | { kind: "stopped"; reason: TurnStopReason };
