import { count, desc, eq, max } from "drizzle-orm";

import type { DbOrTx } from "@mono/db/client";
import { campaign, experimentRun } from "@mono/db";

import type { Campaign, CampaignWithBest } from "../types/Campaign";

export async function getCampaignById(
  db: DbOrTx,
  campaignId: string,
): Promise<Campaign | null> {
  const [row] = await db
    .select()
    .from(campaign)
    .where(eq(campaign.id, campaignId))
    .limit(1);

  return row ?? null;
}

// Looks up the campaign backing a conversation. The chat route uses this to
// decide whether to run the scientist agent instead of the assistant.
export async function getCampaignByConversationId(
  db: DbOrTx,
  conversationId: string,
): Promise<Campaign | null> {
  const [row] = await db
    .select()
    .from(campaign)
    .where(eq(campaign.conversationId, conversationId))
    .limit(1);

  return row ?? null;
}

// Each of the user's campaigns with its best true result so far (highest
// measured conversion across its runs) and run count, computed at query time
// with MAX/COUNT over the joined runs.
export async function listCampaignsWithBest(
  db: DbOrTx,
  userId: string,
): Promise<CampaignWithBest[]> {
  const rows = await db
    .select({
      campaign,
      bestValue: max(experimentRun.measuredValue),
      runCount: count(experimentRun.id),
    })
    .from(campaign)
    .leftJoin(experimentRun, eq(experimentRun.campaignId, campaign.id))
    .where(eq(campaign.userId, userId))
    .groupBy(campaign.id)
    .orderBy(desc(campaign.updatedAt));

  return rows.map((row) => ({
    campaign: row.campaign,
    // numeric MAX comes back as a string; runs may be zero -> null.
    bestValue: row.bestValue == null ? null : Number(row.bestValue),
    runCount: row.runCount,
  }));
}
