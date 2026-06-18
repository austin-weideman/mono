import type { InferAgentUIMessage } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { stepCountIs, ToolLoopAgent } from "ai";

import type { AgentToolConfig, ToolContext, ToolMetadata } from "../types";
import { createTools, generateToolInstructions } from "../tools";
import { InternalTool } from "../types";
import { MAX_AGENT_STEPS } from "./constants";

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
  userId: string;
}

export interface AssistantAgentResult {
  agent: ToolLoopAgent;
  close: () => Promise<void>;
}

const ASSISTANT_TOOL_CONFIG: AgentToolConfig = {
  internal: [
    InternalTool.GET_MY_USER_INFO,
    InternalTool.GET_CURRENT_TIME,
    InternalTool.WEB_SEARCH,
    InternalTool.FETCH_WEB_PAGES,
  ],
};

function buildInstructions(toolMetadata: ToolMetadata[]): string {
  const toolInstructions = generateToolInstructions(toolMetadata);

  return `You are a helpful AI assistant.

${toolInstructions}

You also have access to web search capabilities for finding current information.

Be concise and helpful. Cite sources when using search results.`;
}

export function createAssistantAgent(
  options: CreateAssistantAgentOptions,
): AssistantAgentResult {
  const { gatewayModelId, context, userId } = options;

  const { tools, metadata, close } = createTools(
    context,
    ASSISTANT_TOOL_CONFIG,
  );

  const agent = new ToolLoopAgent({
    model: gateway(gatewayModelId),
    instructions: buildInstructions(metadata),
    tools,
    stopWhen: stepCountIs(MAX_AGENT_STEPS),
    providerOptions: {
      ...REASONING_PROVIDER_OPTIONS,
      gateway: {
        user: userId,
        tags: ["feature:chat"],
      },
    },
  });

  return {
    agent,
    close,
  };
}

export type AssistantMessage = InferAgentUIMessage<
  ReturnType<typeof createAssistantAgent>["agent"]
>;
