import { gateway } from "@ai-sdk/gateway";
import { ToolLoopAgent, stepCountIs } from "ai";
import type { InferAgentUIMessage, ToolSet } from "ai";

import { createSingleMCPClient, mcpServers } from "@microlearn/ai";

import type { ToolContext } from "../types";
import { createInternalTools, generateToolInstructions } from "../tools";

export interface CreateAssistantAgentOptions {
  gatewayModelId: string;
  context: ToolContext;
}

export interface AssistantAgentResult {
  agent: ToolLoopAgent;
  close: () => Promise<void>;
}

function buildInstructions(): string {
  const toolInstructions = generateToolInstructions();

  const baseInstructions = `You are a helpful AI assistant.

${toolInstructions}

You also have access to web search capabilities for finding current information.

Be concise and helpful. Cite sources when using search results.`;

  return baseInstructions;
}

export async function createAssistantAgent(
  options: CreateAssistantAgentOptions,
): Promise<AssistantAgentResult> {
  const { gatewayModelId, context } = options;

  const internalTools = createInternalTools(context);

  const exaClient = await createSingleMCPClient(mcpServers.exa);
  const exaTools = (await exaClient.tools()) as ToolSet;

  const allTools: ToolSet = {
    ...internalTools,
    ...exaTools,
  };

  const agent = new ToolLoopAgent({
    model: gateway(gatewayModelId),
    instructions: buildInstructions(),
    tools: allTools,
    stopWhen: stepCountIs(10),
  });

  return {
    agent,
    close: async () => {
      await exaClient.close();
    },
  };
}

export type AssistantMessage = InferAgentUIMessage<
  Awaited<ReturnType<typeof createAssistantAgent>>["agent"]
>;
