import { mulberry32 } from "./prng";

// A deterministic permutation of [0, n) derived from a seed via a seeded
// Fisher-Yates shuffle. The scrambled-feedback control uses this to decide
// which row's result is shown in place of the one actually run.
export function seededPermutation(n: number, seed: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  const rand = mulberry32(seed);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const ai = arr[i] ?? 0;
    const aj = arr[j] ?? 0;
    arr[i] = aj;
    arr[j] = ai;
  }
  return arr;
}
