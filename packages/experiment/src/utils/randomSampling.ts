import { bestSoFarCurve, meanCurve } from "./convergence";
import { mulberry32 } from "./prng";

// Best-so-far curve under uniform random sampling without replacement, averaged
// over many random orderings via Monte Carlo. This is the "random floor" the
// study compares the agent against — the value of intelligence is the gap above
// it. Deterministic given a seed.
export function randomBaselineCurve(
  values: number[],
  budget: number,
  trials: number,
  seed: number,
): number[] {
  const n = values.length;
  const k = Math.min(budget, n);
  const rand = mulberry32(seed);
  const curves: number[][] = [];

  for (let t = 0; t < trials; t++) {
    // Partial Fisher-Yates: draw k distinct indices uniformly at random.
    const idx = Array.from({ length: n }, (_, i) => i);
    const picked: number[] = [];
    for (let i = 0; i < k; i++) {
      const j = i + Math.floor(rand() * (n - i));
      const ii = idx[i] ?? 0;
      const jj = idx[j] ?? 0;
      idx[i] = jj;
      idx[j] = ii;
      picked.push(values[jj] ?? 0);
    }
    curves.push(bestSoFarCurve(picked));
  }

  return meanCurve(curves);
}
