// Computes the random floor for the mini-study: best-so-far under uniform
// sampling, averaged over many random orderings via Monte Carlo. Pure
// computation — no database, no agents, no cost. Deterministic from the seed.
//
//   pnpm -F @mono/experiment study:baseline
//
// Imports are intentionally granular (not the package index) so this runs
// without database/env credentials.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { datasetValues } from "../src/environment/dataset";
import { randomBaselineCurve } from "../src/utils/randomSampling";

const BUDGET = 20;
const TRIALS = 10_000;
const SEED = 42;

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "..", "study", "results", "random-baseline.json");

const curve = randomBaselineCurve(datasetValues, BUDGET, TRIALS, SEED);

const output = {
  description:
    "Best-so-far conversion under uniform random sampling without replacement, averaged over random orderings (Monte Carlo). The study's random floor.",
  datasetSize: datasetValues.length,
  budget: BUDGET,
  trials: TRIALS,
  seed: SEED,
  generatedAt: new Date().toISOString(),
  // curve[i] = mean best-so-far after (i + 1) experiments
  curve: curve.map((v) => Number(v.toFixed(3))),
  finalMean: Number(curve[curve.length - 1]?.toFixed(3) ?? 0),
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Random baseline (${TRIALS} trials, budget ${BUDGET}): mean best-so-far reaches ${output.finalMean}`,
);
console.log(`Wrote ${outPath}`);
