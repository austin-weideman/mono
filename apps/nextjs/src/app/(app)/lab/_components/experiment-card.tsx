import { cn } from "@mono/ui";

// Loose shapes for the run_experiment tool input/output as they arrive in the
// UIMessage tool part. Validated defensively at render time.
interface ExperimentInput {
  params?: Record<string, string | number>;
  predictedValue?: number;
}

interface ExperimentOutput {
  ok?: boolean;
  iteration?: number;
  // The value the agent saw (= true measurement unless feedback is scrambled).
  shownValue?: number;
  predictedValue?: number;
  remainingExperiments?: number;
  errors?: string[];
}

interface ExperimentCardProps {
  input: ExperimentInput | undefined;
  output: ExperimentOutput | undefined;
  isError: boolean;
  // When the campaign scrambles feedback, the value the agent received is NOT
  // this recipe's true result — label it accordingly.
  scrambled?: boolean;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function ExperimentCard({
  input,
  output,
  isError,
  scrambled,
}: ExperimentCardProps) {
  const params = input?.params ?? {};
  const predicted = input?.predictedValue;
  const rejected = isError || output?.ok === false;
  const shown = output?.shownValue;
  const iteration = output?.iteration;

  return (
    <div
      className={cn(
        "bg-muted/40 flex flex-col gap-2 rounded-xl border px-3.5 py-2.5 text-sm",
        rejected && "border-destructive/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">
          {iteration != null ? `Experiment ${iteration}` : "Experiment"}
        </span>
        {rejected ? (
          <span className="text-destructive text-xs font-medium">rejected</span>
        ) : shown != null ? (
          <span className="text-muted-foreground text-xs">
            predicted {predicted != null ? formatNumber(predicted) : "—"} ·{" "}
            {scrambled ? (
              <span
                className="font-semibold text-amber-600 dark:text-amber-500"
                title="Scrambled feedback: this is a different recipe's value, not this experiment's true result. The chart shows the true value."
              >
                shown {formatNumber(shown)} (scrambled)
              </span>
            ) : (
              <span className="text-foreground font-semibold">
                measured {formatNumber(shown)}
              </span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">running…</span>
        )}
      </div>

      {Object.keys(params).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(params).map(([key, value]) => (
            <span
              key={key}
              className="bg-background text-muted-foreground rounded-md border px-1.5 py-0.5 text-xs"
            >
              <span className="font-medium">{key}</span>: {String(value)}
            </span>
          ))}
        </div>
      )}

      {rejected && output?.errors && output.errors.length > 0 && (
        <ul className="text-destructive list-disc pl-4 text-xs">
          {output.errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
