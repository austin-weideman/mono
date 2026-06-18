// A generated scientific figure, not a photograph: the best-so-far trajectory
// of one campaign climbing above the random-sampling floor. Dark ground with
// the lime signal reserved for the best-so-far curve and its leading node, so
// the interface accent and the subject matter share one color language.

const VIEW_W = 480;
const VIEW_H = 280;
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 18;
const PAD_B = 22;

// Best true conversion measured at each iteration (scattered), and the
// monotonic best-so-far envelope the agent actually cares about.
const MEASURED = [
  31, 18, 44, 39, 58, 26, 63, 71, 52, 68, 79, 61, 84, 77, 88, 73, 91, 85, 94,
  89,
];
// Random-sampling floor: best-so-far under uniform draws (slow, diminishing).
const RANDOM_FLOOR = [
  31, 31, 44, 44, 58, 58, 63, 63, 63, 68, 68, 68, 68, 71, 71, 71, 74, 74, 74,
  76,
];

const N = MEASURED.length;

function bestSoFar(values: number[]): number[] {
  let best = -Infinity;
  return values.map((v) => (best = Math.max(best, v)));
}

const BEST = bestSoFar(MEASURED);

function x(i: number): number {
  return PAD_L + (i / (N - 1)) * (VIEW_W - PAD_L - PAD_R);
}
function y(value: number): number {
  // value 0..100 mapped into the plot height, inverted.
  return PAD_T + (1 - value / 100) * (VIEW_H - PAD_T - PAD_B);
}

// Stepped (best-so-far holds until it improves).
function stepPath(values: number[]): string {
  let d = `M${x(0)} ${y(values[0] ?? 0)}`;
  for (let i = 1; i < values.length; i++) {
    d += ` L${x(i)} ${y(values[i - 1] ?? 0)} L${x(i)} ${y(values[i] ?? 0)}`;
  }
  return d;
}

export function TrajectoryFigure() {
  const lastX = x(N - 1);
  const lastY = y(BEST[N - 1] ?? 0);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Best-so-far conversion climbing above the random-sampling floor across twenty experiments."
    >
      {/* hairline grid */}
      {[0, 25, 50, 75, 100].map((v) => (
        <line
          key={v}
          x1={PAD_L}
          x2={VIEW_W - PAD_R}
          y1={y(v)}
          y2={y(v)}
          stroke="var(--color-graphite)"
          strokeWidth={0.5}
          opacity={0.5}
        />
      ))}

      {/* random floor */}
      <path
        d={stepPath(RANDOM_FLOOR)}
        fill="none"
        stroke="var(--color-graphite)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />

      {/* measured scatter */}
      {MEASURED.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={2.5}
          fill="none"
          stroke="var(--color-lichen)"
          strokeWidth={1}
          opacity={0.7}
        />
      ))}

      {/* best-so-far envelope: the one lime curve */}
      <path
        d={stepPath(BEST)}
        fill="none"
        stroke="var(--color-bioluminescent-lime)"
        strokeWidth={2}
      />

      {/* leading node */}
      <circle
        cx={lastX}
        cy={lastY}
        r={6}
        fill="var(--color-bioluminescent-lime)"
        opacity={0.18}
      />
      <circle
        cx={lastX}
        cy={lastY}
        r={3}
        fill="var(--color-bioluminescent-lime)"
      />
    </svg>
  );
}
