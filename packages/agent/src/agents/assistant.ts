import type { InferAgentUIMessage } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { stepCountIs, ToolLoopAgent } from "ai";

import type { AgentToolConfig, ToolContext, ToolMetadata } from "../types";
import { createTools, generateToolInstructions } from "../tools";
import { ExternalToolSet, InternalTool } from "../types";

const MAX_AGENT_STEPS = 50;

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
  // Note: xAI reasoningEffort requires the Responses API (xai.responses()),
  // which isn't available through the AI Gateway's chat completions endpoint.
};

export interface CreateAssistantAgentOptions {
  gatewayModelId: string;
  context: ToolContext;
}

export interface AssistantAgentResult {
  agent: ToolLoopAgent;
  close: () => Promise<void>;
}

const ASSISTANT_TOOL_CONFIG: AgentToolConfig = {
  internal: [InternalTool.GET_MY_USER_INFO, InternalTool.GET_CURRENT_TIME],
  external: [ExternalToolSet.EXA],
};

function buildInstructions(toolMetadata: ToolMetadata[]): string {
  const toolInstructions = generateToolInstructions(toolMetadata);

  return `You are a helpful AI assistant.

${toolInstructions}

You also have access to web search capabilities for finding current information.

Be concise and helpful. Cite sources when using search results.`;
}

export async function createAssistantAgent(
  options: CreateAssistantAgentOptions,
): Promise<AssistantAgentResult> {
  const { gatewayModelId, context } = options;

  const { tools, metadata, close } = await createTools(
    context,
    ASSISTANT_TOOL_CONFIG,
  );

  const agent = new ToolLoopAgent({
    model: gateway(gatewayModelId),
    instructions: buildInstructions(metadata),
    tools,
    stopWhen: stepCountIs(MAX_AGENT_STEPS),
    providerOptions: REASONING_PROVIDER_OPTIONS,
  });

  return {
    agent,
    close,
  };
}

export type AssistantMessage = InferAgentUIMessage<
  Awaited<ReturnType<typeof createAssistantAgent>>["agent"]
>;
