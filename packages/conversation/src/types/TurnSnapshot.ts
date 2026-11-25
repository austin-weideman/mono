import type { ChatTurnStatus } from "./ChatTurnStatus";

// The parts of a turn a client needs to render it and resume its stream.
export interface TurnSnapshot {
  id: string;
  status: ChatTurnStatus;
  assistantMessageId: string;
  persistedEventId: string | null;
}
