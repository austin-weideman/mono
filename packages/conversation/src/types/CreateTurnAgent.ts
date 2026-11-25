import type { ChatAgent } from "@mono/agent";

import type { ChatTurn } from "./ChatTurn";

export type CreateTurnAgent = (turn: ChatTurn) => Promise<ChatAgent>;
