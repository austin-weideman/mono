import type { ParameterValues } from "./ParameterSpace";

// One row of the vendored dataset: a set of settings and the value someone
// already measured for them. The environment is a replay over these.
export interface Measurement {
  params: ParameterValues;
  value: number;
}

// What runExperiment returns: the true measurement and the value the agent is
// shown. They differ only under scrambled feedback.
export interface ExperimentResult {
  measured: number;
  shown: number;
}
