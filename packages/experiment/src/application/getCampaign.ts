import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { isUserActor } from "@mono/core-types";
import { ForbiddenError, NotFoundError } from "@mono/errors";

import type { Campaign } from "../types/Campaign";
import { getCampaignById } from "../persistence/campaign.queries";

export async function getCampaign(
  db: DbOrTx,
  actor: Actor,
  input: { campaignId: string },
): Promise<Campaign> {
  const campaign = await getCampaignById(db, input.campaignId);

  if (!campaign) {
    throw new NotFoundError(`Campaign not found: ${input.campaignId}`);
  }

  if (isUserActor(actor) && campaign.userId !== actor.userId) {
    throw new ForbiddenError("You do not have access to this campaign");
  }

  return campaign;
}
