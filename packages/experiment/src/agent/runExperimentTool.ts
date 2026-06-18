import { tool } from "ai";
import { z } from "zod";

import type { DbOrTx } from "@mono/db/client";

import type { Campaign } from "../types/Campaign";
import type { ParameterSpace } from "../types/ParameterSpace";
import { runExperiment } from "../environment/runExperiment";
import { validateParams } from "../environment/validateParams";
import { insertExperimentRun } from "../persistence/experiment-run.mutations";
import { getMaxIteration } from "../persistence/experiment-run.queries";

export const RUN_EXPERIMENT_TOOL_NAME = "run_experiment";

export interface CreateRunExperimentToolOptions {
  db: DbOrTx;
  campaign: Campaign;
  // The space the agent sees (real or name-ablated) — proposals are validated
  // against this.
  presentedSpace: ParameterSpace;
  // Converts a validated proposal back to real params for lookup + persistence.
  toRealParams: (
    params: Record<string, number | string>,
  ) => Record<string, number | string>;
}

// One tool, executes inline. Validates, assigns the next iteration, runs the
// experiment (the single seam), and writes the complete experiment_run row in
// one insert. Returns the shown value — under scrambled feedback this differs
// from the true measurement, but the tool just returns whatever the environment
// gives back.
export function createRunExperimentTool(
  options: CreateRunExperimentToolOptions,
) {
  const { db, campaign, presentedSpace, toRealParams } = options;
  const { objective } = presentedSpace;

  return tool({
    description: `Run one experiment: set every control variable and commit a numeric prediction of the ${objective.label}. Returns the measured value. Invalid proposals are reported back without consuming a budget slot.`,
    inputSchema: z.object({
      params: z
        .record(z.string(), z.union([z.string(), z.number()]))
        .describe(
          "An object setting every control variable to one of its allowed values.",
        ),
      predictedValue: z
        .number()
        .describe(
          `Your numeric prediction of the result (${objective.min}-${objective.max}), committed before seeing the outcome.`,
        ),
    }),
    execute: async ({ params, predictedValue }) => {
      const validation = validateParams(presentedSpace, params);
      if (!validation.ok) {
        return {
          ok: false as const,
          errors: validation.errors,
          message:
            "Proposal rejected — no experiment was run and no budget was consumed. Fix the issues and call again.",
        };
      }

      const realParams = toRealParams(params);
      const { measured, shown } = runExperiment(campaign, realParams);

      const iteration = (await getMaxIteration(db, campaign.id)) + 1;

      await insertExperimentRun(db, {
        campaignId: campaign.id,
        iteration,
        params: realParams,
        predictedValue: String(predictedValue),
        measuredValue: String(measured),
        shownValue: String(shown),
      });

      const remaining = Math.max(0, campaign.maxIterations - iteration);
      return {
        ok: true as const,
        iteration,
        // The value the agent sees (= true measurement unless feedback is
        // scrambled). Deliberately NOT named measuredValue: under scrambled
        // feedback this is a different recipe's value, not this experiment's
        // true result.
        shownValue: shown,
        predictedValue,
        remainingExperiments: remaining,
        budgetExhausted: remaining === 0,
      };
    },
  });
}
