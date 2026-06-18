import { eq, sql } from "drizzle-orm";

import type { DbOrTx } from "@mono/db/client";
import { campaign } from "@mono/db";
import { InternalServerError } from "@mono/errors";

import type { Campaign } from "../types/Campaign";

export interface InsertCampaignInput {
  userId: string;
  conversationId: string;
  title?: string | null;
  environmentKey: string;
  supervised: boolean;
  hideNames: boolean;
  maxIterations: number;
  scrambleSeed: number | null;
}

export async function insertCampaign(
  db: DbOrTx,
  input: InsertCampaignInput,
): Promise<Campaign> {
  const [row] = await db.insert(campaign).values(input).returning();

  if (!row) {
    throw new InternalServerError("Failed to insert campaign");
  }

  return row;
}

export async function touchCampaign(
  db: DbOrTx,
  campaignId: string,
): Promise<void> {
  await db
    .update(campaign)
    .set({ updatedAt: sql`NOW()` })
    .where(eq(campaign.id, campaignId));
}
