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

const permutationCache = new Map<number, number[]>();

function getPermutation(seed: number): number[] {
  let perm = permutationCache.get(seed);
  if (!perm) {
    perm = seededPermutation(datasetValues.length, seed);
    permutationCache.set(seed, perm);
  }
  return perm;
}

// Scrambled feedback shows the value of a different row, chosen by a seeded permutation.
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

// Takes real parameter names; the tool converts hidden-name proposals back before calling.
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
