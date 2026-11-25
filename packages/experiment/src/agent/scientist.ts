import type { ToolSet } from "ai";
import { gateway } from "@ai-sdk/gateway";

import type { ChatAgent, ToolContext } from "@mono/agent";
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

export function createScientistAgent(
  options: CreateScientistAgentOptions,
): ChatAgent {
  const { gatewayModelId, campaign, context, userId } = options;

  const { presentedSpace, toRealParams } = presentEnvironment(campaign);

  const tools: ToolSet = {
    [RUN_EXPERIMENT_TOOL_NAME]: createRunExperimentTool({
      db: context.db,
      campaign,
      presentedSpace,
      toRealParams,
    }),
  };

  return {
    model: gateway(gatewayModelId),
    instructions: buildScientistInstructions(presentedSpace, campaign),
    tools,
    maxSteps: MAX_AGENT_STEPS,
    providerOptions: {
      ...REASONING_PROVIDER_OPTIONS,
      gateway: {
        user: userId,
        tags: ["feature:lab"],
      },
    },
    close: () => Promise.resolve(),
  };
}
