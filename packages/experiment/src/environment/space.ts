import { BadRequestError } from "@mono/errors";

import type { ParameterSpace } from "../types/ParameterSpace";
import { reductiveAminationSpace } from "./dataset";

export const REDUCTIVE_AMINATION = "reductive_amination";

export function isKnownEnvironment(environmentKey: string): boolean {
  return environmentKey === REDUCTIVE_AMINATION;
}

// What knobs exist and what values are allowed, keyed by environmentKey. Used
// to build the prompt and validate proposals.
export function space(environmentKey: string): ParameterSpace {
  if (environmentKey === REDUCTIVE_AMINATION) {
    return reductiveAminationSpace();
  }
  throw new BadRequestError(`Unknown environment: ${environmentKey}`);
}
