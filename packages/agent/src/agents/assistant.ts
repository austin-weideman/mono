import { gateway } from "@ai-sdk/gateway";
import { ToolLoopAgent, stepCountIs } from "ai";
import type { InferAgentUIMessage } from "ai";

import type { AgentToolConfig, ToolContext, ToolMetadata } from "../types";
import { ExternalToolSet, InternalTool } from "../types";
import { createTools, generateToolInstructions } from "../tools";

export interface CreateAssistantAgentOptions {
  gatewayModelId: string;
  context: ToolContext;
}

export interface AssistantAgentResult {
  agent: ToolLoopAgent;
  close: () => Promise<void>;
}

const ASSISTANT_TOOL_CONFIG: AgentToolConfig = {
  internal: [InternalTool.GET_MY_USER_INFO],
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
    stopWhen: stepCountIs(10),
  });

  return {
    agent,
    close,
  };
}

export type AssistantMessage = InferAgentUIMessage<
  Awaited<ReturnType<typeof createAssistantAgent>>["agent"]
>;
