import type { CreateTurnAgent } from "@mono/conversation";
import type { DbOrTx } from "@mono/db/client";
import { userActor } from "@mono/core-types";
import { NotFoundError } from "@mono/errors";

import { getCampaignByConversationId } from "../persistence/campaign.queries";
import { createScientistAgent } from "./scientist";

// Builds the scientist for a turn from the campaign that owns its conversation.
export function scientistTurnAgent(db: DbOrTx): CreateTurnAgent {
  return async (turn) => {
    const campaign = await getCampaignByConversationId(db, turn.conversationId);
    if (!campaign) {
      throw new NotFoundError(
        `No campaign for conversation ${turn.conversationId}`,
      );
    }
    return createScientistAgent({
      gatewayModelId: turn.gatewayModelId,
      campaign,
      context: { db, actor: userActor(turn.userId) },
      userId: turn.userId,
    });
  };
}
