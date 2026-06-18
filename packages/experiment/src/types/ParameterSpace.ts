// The parameter space and objective for an environment. Built from the
// environment definition and used to construct the agent's prompt and to
// validate proposals. Under the hidden-names control a name-ablated copy of
// this same shape is what the agent sees.

export interface CategoricalOption {
  value: string;
  // Per-option descriptor vector from upstream config.json. Used only by the
  // Bayesian-optimization follow-up; null when upstream had none.
  descriptor: number[] | null;
}

export interface CategoricalParameter {
  name: string;
  label: string;
  description: string;
  type: "categorical";
  options: CategoricalOption[];
}

export interface DiscreteParameter {
  name: string;
  label: string;
  description: string;
  type: "discrete";
  low: number;
  high: number;
  options: number[];
}

export type ParameterDefinition = CategoricalParameter | DiscreteParameter;

export interface Objective {
  name: string;
  label: string;
  unit: string;
  direction: "maximize" | "minimize";
  min: number;
  max: number;
}

export interface ParameterSpace {
  environmentKey: string;
  description: string;
  objective: Objective;
  parameters: ParameterDefinition[];
}

// A concrete set of parameter settings proposed for one experiment.
export type ParameterValues = Record<string, number | string>;
