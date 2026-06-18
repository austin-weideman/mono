import { BadRequestError } from "@mono/errors";

import type { ExperimentResult, ParameterValues } from "../types";
import type { Campaign } from "../types/Campaign";
import { seededPermutation } from "../utils/permutation";
import {
  canonicalKey,
  datasetValues,
  lookupIndex,
  lookupValue,
} from "./dataset";

// Memoize the (cheap) 768-element permutation per seed so a campaign's ~20 tool
// calls don't each rebuild it.
const permutationCache = new Map<number, number[]>();

function getPermutation(seed: number): number[] {
  let perm = permutationCache.get(seed);
  if (!perm) {
    perm = seededPermutation(datasetValues.length, seed);
    permutationCache.set(seed, perm);
  }
  return perm;
}

// Under scrambled feedback we show the value of a *different* row, chosen by a
// seeded permutation. A learner degrades; a memorizer doesn't notice.
function scrambledValue(params: ParameterValues, seed: number): number {
  const index = lookupIndex(params);
  if (index === undefined) {
    throw new BadRequestError(
      `Combination not in dataset: ${canonicalKey(params)}`,
    );
  }
  const perm = getPermutation(seed);
  const shownIndex = perm[index] ?? index;
  const shown = datasetValues[shownIndex];
  if (shown === undefined) {
    throw new BadRequestError(`Scramble lookup failed for index ${index}`);
  }
  return shown;
}

// The single execution seam. Point this at a simulator or a real lab later and
// nothing upstream changes. Takes REAL params (the tool converts ablated
// proposals back before calling). Returns the true value and the value the
// agent sees — equal unless the campaign carries a scramble seed.
export function runExperiment(
  campaign: Pick<Campaign, "environmentKey" | "scrambleSeed">,
  params: ParameterValues,
): ExperimentResult {
  const measured = lookupValue(params);
  if (measured === undefined) {
    throw new BadRequestError(
      `Combination not in dataset: ${canonicalKey(params)}`,
    );
  }

  if (campaign.scrambleSeed == null) {
    return { measured, shown: measured };
  }

  return { measured, shown: scrambledValue(params, campaign.scrambleSeed) };
}
