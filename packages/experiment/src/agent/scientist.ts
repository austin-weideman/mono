import type { InferAgentUIMessage, ToolSet } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { stepCountIs, ToolLoopAgent } from "ai";

import type { ToolContext } from "@mono/agent";
import { MAX_AGENT_STEPS } from "@mono/agent";

import type { Campaign } from "../types/Campaign";
import { presentEnvironment } from "./presentEnvironment";
import { buildScientistInstructions } from "./prompt";
import {
  createRunExperimentTool,
  RUN_EXPERIMENT_TOOL_NAME,
} from "./runExperimentTool";

// Mirrors assistant.ts: same provider reasoning options. Kept local rather than
// shared because it is provider tuning, not behavior the two agents must keep
// identical.
const REASONING_PROVIDER_OPTIONS = {
  anthropic: {
    thinking: { type: "enabled" as const, budgetTokens: 16384 },
  },
  google: {
    thinkingConfig: { includeThoughts: true },
  },
  openai: {
    reasoningEffort: "medium" as const,
    reasoningSummary: "auto" as const,
  },
};

export interface CreateScientistAgentOptions {
  gatewayModelId: string;
  campaign: Campaign;
  context: ToolContext;
  userId: string;
}

export interface ScientistAgentResult {
  agent: ToolLoopAgent;
  close: () => Promise<void>;
}

export function createScientistAgent(
  options: CreateScientistAgentOptions,
): ScientistAgentResult {
  const { gatewayModelId, campaign, context, userId } = options;

  const { presentedSpace, toRealParams } = presentEnvironment(campaign);

  // Typed as ToolSet (not the inferred single-tool shape) so the constructed
  // agent is assignable to the bare ToolLoopAgent in ScientistAgentResult —
  // same pattern createTools uses for the assistant agent.
  const tools: ToolSet = {
    [RUN_EXPERIMENT_TOOL_NAME]: createRunExperimentTool({
      db: context.db,
      campaign,
      presentedSpace,
      toRealParams,
    }),
  };

  const agent = new ToolLoopAgent({
    model: gateway(gatewayModelId),
    instructions: buildScientistInstructions(presentedSpace, campaign),
    tools,
    stopWhen: stepCountIs(MAX_AGENT_STEPS),
    providerOptions: {
      ...REASONING_PROVIDER_OPTIONS,
      gateway: {
        user: userId,
        tags: ["feature:lab"],
      },
    },
  });

  return {
    agent,
    close: async () => {
      // No external resources to release.
    },
  };
}

export type ScientistMessage = InferAgentUIMessage<
  ReturnType<typeof createScientistAgent>["agent"]
>;
