import type { UIMessage } from "ai";

import type { ChatTurnAgent } from "./ChatTurnAgent";

export interface StartTurnInput {
  turnId: string;
  conversationId: string;
  agent: ChatTurnAgent;
  gatewayModelId: string;
  userMessage: { id: string; parts: UIMessage["parts"] };
}
