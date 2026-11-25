import type { UIMessage, UIMessageChunk } from "ai";

import type { TerminalTurnStatus } from "./TerminalTurnStatus";

// What a turn's event log carries. `reset` replaces the client's copy of the
// assistant message after a step restarts; `end` is always the last event.
export type TurnEvent =
  | { type: "chunks"; chunks: UIMessageChunk[] }
  | { type: "reset"; message: UIMessage }
  | { type: "end"; status: TerminalTurnStatus };
