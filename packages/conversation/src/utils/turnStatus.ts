import type { ChatTurnStatus } from "../types/ChatTurnStatus";
import type { TerminalTurnStatus } from "../types/TerminalTurnStatus";

export const ACTIVE_TURN_STATUSES = [
  "queued",
  "streaming",
] as const satisfies readonly ChatTurnStatus[];

export function isActiveTurnStatus(status: ChatTurnStatus): boolean {
  switch (status) {
    case "queued":
    case "streaming":
      return true;
    case "completed":
    case "failed":
    case "cancelled":
      return false;
  }
}

export function asTerminalTurnStatus(
  status: ChatTurnStatus,
): TerminalTurnStatus | null {
  switch (status) {
    case "queued":
    case "streaming":
      return null;
    case "completed":
    case "failed":
    case "cancelled":
      return status;
  }
}
