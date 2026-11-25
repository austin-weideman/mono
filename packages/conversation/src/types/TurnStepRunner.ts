// Runs one durable unit of a turn. Inngest's step.run memoizes it; a plain
// runner just calls it.
export interface TurnStepRunner {
  run: <T>(id: string, fn: () => Promise<T>) => Promise<T>;
  // Zero on the first try of the step being executed.
  attempt: number;
}
