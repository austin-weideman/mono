import type {
  ParameterDefinition,
  ParameterSpace,
  ParameterValues,
} from "../types/ParameterSpace";

// The hidden-names control. Strips every human-meaningful label from the space
// so the agent cannot lean on prior chemistry knowledge — what survives is
// experimental skill. The mapping is stable (index-based) and invertible: the
// tool converts the agent's ablated proposals back to real params before lookup
// and persistence, and the UI always shows the real names.
//
// Parameter `i` (0-based) becomes `x{i+1}`. A categorical option `j` becomes
// `option_{j+1}`. Discrete numeric options keep their numbers (bare ordinals
// carry no chemistry), and all descriptions are blanked.

export interface NameAblation {
  ablatedSpace: ParameterSpace;
  // ablated param dict -> real param dict (for lookup + persistence)
  toReal: (params: ParameterValues) => ParameterValues;
  // real param dict -> ablated param dict (for completeness / tests)
  toAblated: (params: ParameterValues) => ParameterValues;
}

function ablatedParamName(index: number): string {
  return `x${index + 1}`;
}

function ablatedOptionValue(index: number): string {
  return `option_${index + 1}`;
}

export function buildNameAblation(space: ParameterSpace): NameAblation {
  // real param name -> ablated param name, and the reverse
  const realToAblatedName = new Map<string, string>();
  const ablatedToRealName = new Map<string, string>();
  // per real param name: real option value <-> ablated option value
  const realToAblatedOption = new Map<string, Map<string, string>>();
  const ablatedToRealOption = new Map<string, Map<string, string>>();

  const ablatedParameters: ParameterDefinition[] = space.parameters.map(
    (param, i) => {
      const newName = ablatedParamName(i);
      realToAblatedName.set(param.name, newName);
      ablatedToRealName.set(newName, param.name);

      if (param.type === "categorical") {
        const r2a = new Map<string, string>();
        const a2r = new Map<string, string>();
        const options = param.options.map((opt, j) => {
          const newValue = ablatedOptionValue(j);
          r2a.set(opt.value, newValue);
          a2r.set(newValue, opt.value);
          return { value: newValue, descriptor: opt.descriptor };
        });
        realToAblatedOption.set(param.name, r2a);
        ablatedToRealOption.set(newName, a2r);
        return {
          name: newName,
          label: newName,
          description: "",
          type: "categorical",
          options,
        };
      }

      return {
        name: newName,
        label: newName,
        description: "",
        type: "discrete",
        low: param.low,
        high: param.high,
        options: param.options.slice(),
      };
    },
  );

  const ablatedSpace: ParameterSpace = {
    environmentKey: space.environmentKey,
    description:
      "An experimental system with the control variables listed below. Variable names and option labels have been anonymized.",
    objective: { ...space.objective, label: "objective", name: "objective" },
    parameters: ablatedParameters,
  };

  const toReal = (params: ParameterValues): ParameterValues => {
    const out: ParameterValues = {};
    for (const [ablName, value] of Object.entries(params)) {
      const realName = ablatedToRealName.get(ablName) ?? ablName;
      const optionMap = ablatedToRealOption.get(ablName);
      out[realName] =
        optionMap && typeof value === "string"
          ? (optionMap.get(value) ?? value)
          : value;
    }
    return out;
  };

  const toAblated = (params: ParameterValues): ParameterValues => {
    const out: ParameterValues = {};
    for (const [realName, value] of Object.entries(params)) {
      const ablName = realToAblatedName.get(realName) ?? realName;
      const optionMap = realToAblatedOption.get(realName);
      out[ablName] =
        optionMap && typeof value === "string"
          ? (optionMap.get(value) ?? value)
          : value;
    }
    return out;
  };

  return { ablatedSpace, toReal, toAblated };
}
