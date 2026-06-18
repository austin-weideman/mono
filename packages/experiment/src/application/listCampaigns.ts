import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ForbiddenError } from "@mono/errors";

import type { CampaignWithBest } from "../types/Campaign";
import { listCampaignsWithBest } from "../persistence/campaign.queries";

export async function listCampaigns(
  db: DbOrTx,
  actor: Actor,
  input: { userId: string },
): Promise<CampaignWithBest[]> {
  if (isUserActor(actor) && actor.userId !== input.userId) {
    throw new ForbiddenError("You can only list your own campaigns");
  }

  return await listCampaignsWithBest(db, input.userId);
}
