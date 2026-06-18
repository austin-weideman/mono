import type { ParameterSpace, ParameterValues } from "../types/ParameterSpace";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

// Validates a proposal against a parameter space (real or name-ablated — the
// caller passes whichever space the agent was shown). Invalid proposals are
// reported back in the tool result so the agent corrects in-turn.
export function validateParams(
  space: ParameterSpace,
  params: ParameterValues,
): ValidationResult {
  const errors: string[] = [];
  const allowedNames = new Set(space.parameters.map((p) => p.name));

  for (const key of Object.keys(params)) {
    if (!allowedNames.has(key)) {
      errors.push(`Unknown parameter "${key}".`);
    }
  }

  for (const param of space.parameters) {
    const value = params[param.name];
    if (value === undefined) {
      errors.push(`Missing parameter "${param.name}".`);
      continue;
    }

    if (param.type === "categorical") {
      const allowed = param.options.map((o) => o.value);
      if (typeof value !== "string" || !allowed.includes(value)) {
        errors.push(
          `Invalid value for "${param.name}": ${JSON.stringify(value)}. Allowed: ${allowed.join(", ")}.`,
        );
      }
    } else {
      const numeric = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numeric) || !param.options.includes(numeric)) {
        errors.push(
          `Invalid value for "${param.name}": ${JSON.stringify(value)}. Allowed: ${param.options.join(", ")}.`,
        );
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
