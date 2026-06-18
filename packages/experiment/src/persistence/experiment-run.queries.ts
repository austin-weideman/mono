import { asc, eq, max } from "drizzle-orm";

import type { DbOrTx } from "@mono/db/client";
import { experimentRun } from "@mono/db";

import type { ExperimentRun } from "../types/Campaign";

export async function listExperimentRunsForCampaign(
  db: DbOrTx,
  campaignId: string,
): Promise<ExperimentRun[]> {
  return await db
    .select()
    .from(experimentRun)
    .where(eq(experimentRun.campaignId, campaignId))
    .orderBy(asc(experimentRun.iteration));
}

// Highest iteration number recorded so far (0 if none). The tool assigns the
// next iteration as this + 1.
export async function getMaxIteration(
  db: DbOrTx,
  campaignId: string,
): Promise<number> {
  const [row] = await db
    .select({ maxIteration: max(experimentRun.iteration) })
    .from(experimentRun)
    .where(eq(experimentRun.campaignId, campaignId));

  return row?.maxIteration ?? 0;
}
