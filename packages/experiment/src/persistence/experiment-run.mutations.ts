import type { DbOrTx } from "@mono/db/client";
import { experimentRun } from "@mono/db";
import { InternalServerError } from "@mono/errors";

import type { ExperimentRun } from "../types/Campaign";
import type { ParameterValues } from "../types/ParameterSpace";

export interface InsertExperimentRunInput {
  campaignId: string;
  iteration: number;
  params: ParameterValues;
  // numeric columns round-trip as strings in Drizzle.
  predictedValue: string;
  measuredValue: string;
  shownValue: string;
}

export async function insertExperimentRun(
  db: DbOrTx,
  input: InsertExperimentRunInput,
): Promise<ExperimentRun> {
  const [row] = await db.insert(experimentRun).values(input).returning();

  if (!row) {
    throw new InternalServerError("Failed to insert experiment run");
  }

  return row;
}
