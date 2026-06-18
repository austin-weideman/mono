// The best-so-far curve: at each iteration, the best (max) value seen up to and
// including that iteration. This is the trajectory the chart and the study plot.
export function bestSoFarCurve(values: number[]): number[] {
  const curve: number[] = [];
  let best = -Infinity;
  for (const v of values) {
    if (v > best) best = v;
    curve.push(best);
  }
  return curve;
}

// Mean of an array, or null when empty.
export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

// Element-wise mean across several equal-length curves. Used to average the
// best-so-far curves of repeated runs into one line per study condition.
export function meanCurve(curves: number[][]): number[] {
  const length = curves[0]?.length ?? 0;
  const out: number[] = [];
  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (const curve of curves) sum += curve[i] ?? 0;
    out.push(sum / curves.length);
  }
  return out;
}
