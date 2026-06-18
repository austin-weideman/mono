import { z } from "zod";

import type { ParameterSpace } from "../types/ParameterSpace";
import rawReductiveAmination from "../data/reductive-amination.json";

// Validates the vendored dataset at load. Bundles into serverless functions —
// zero runtime file I/O, zero seeding. The answer key (measurements) lives only
// here; the agent never sees this file, only results of experiments it runs.

const categoricalOptionSchema = z.object({
  value: z.string(),
  descriptor: z.array(z.number()).nullable(),
});

const categoricalParameterSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string(),
  type: z.literal("categorical"),
  options: z.array(categoricalOptionSchema).min(1),
});

const discreteParameterSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string(),
  type: z.literal("discrete"),
  low: z.number(),
  high: z.number(),
  options: z.array(z.number()).min(1),
});

const parameterSchema = z.discriminatedUnion("type", [
  categoricalParameterSchema,
  discreteParameterSchema,
]);

const objectiveSchema = z.object({
  name: z.string(),
  label: z.string(),
  unit: z.string(),
  direction: z.enum(["maximize", "minimize"]),
  min: z.number(),
  max: z.number(),
});

const measurementSchema = z.object({
  params: z.record(z.string(), z.union([z.string(), z.number()])),
  value: z.number(),
});

const datasetSchema = z.object({
  source: z.looseObject({ environmentKey: z.string() }),
  description: z.string(),
  objective: objectiveSchema,
  parameters: z.array(parameterSchema).min(1),
  measurements: z.array(measurementSchema).min(1),
});

export type Dataset = z.infer<typeof datasetSchema>;

const dataset: Dataset = datasetSchema.parse(rawReductiveAmination);

// Parameter order is fixed by the dataset; the lookup key concatenates values
// in this order. Numbers stringify consistently (1.0 -> "1"), matching how the
// agent's numeric proposals compare against stored measurements.
const PARAM_ORDER = dataset.parameters.map((p) => p.name);

export function canonicalKey(params: Record<string, number | string>): string {
  return PARAM_ORDER.map((name) => String(params[name])).join("||");
}

// canonical key -> measured value, and key -> dense index (for scrambling).
const valueByKey = new Map<string, number>();
const indexByKey = new Map<string, number>();
dataset.measurements.forEach((m, i) => {
  const key = canonicalKey(m.params);
  valueByKey.set(key, m.value);
  indexByKey.set(key, i);
});

// The dense list of true values in dataset order — the population the random
// baseline samples and the scramble permutation indexes into.
export const datasetValues: number[] = dataset.measurements.map((m) => m.value);

export function getDataset(): Dataset {
  return dataset;
}

export function getParamOrder(): string[] {
  return PARAM_ORDER.slice();
}

// True value for a set of params, or undefined if the combination is not in the
// dataset (should never happen for params validated against the space).
export function lookupValue(
  params: Record<string, number | string>,
): number | undefined {
  return valueByKey.get(canonicalKey(params));
}

export function lookupIndex(
  params: Record<string, number | string>,
): number | undefined {
  return indexByKey.get(canonicalKey(params));
}

// The real (non-ablated) parameter space + objective for this environment.
export function reductiveAminationSpace(): ParameterSpace {
  return {
    environmentKey: dataset.source.environmentKey,
    description: dataset.description,
    objective: dataset.objective,
    parameters: dataset.parameters,
  };
}
