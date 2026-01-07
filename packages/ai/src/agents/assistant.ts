import { gateway } from "@ai-sdk/gateway"
import { ToolLoopAgent, stepCountIs } from "ai"
import type { InferAgentUIMessage, ToolSet } from "ai"

import { createSingleMCPClient } from "../mcp/client"
import { mcpServers } from "../mcp/servers"

export interface CreateAssistantAgentOptions {
  gatewayModelId: string
}

export interface AssistantAgentResult {
  agent: ToolLoopAgent
  close: () => Promise<void>
}

export async function createAssistantAgent(
  options: CreateAssistantAgentOptions,
): Promise<AssistantAgentResult> {
  const { gatewayModelId } = options

  const exaClient = await createSingleMCPClient(mcpServers.exa)
  const exaTools = (await exaClient.tools()) as ToolSet

  const agent = new ToolLoopAgent({
    model: gateway(gatewayModelId),

    instructions: `You are a helpful AI assistant.

You have access to web search capabilities. Use them when:
- The user asks about current events or recent information
- You need to verify facts or find up-to-date data
- The user explicitly asks you to search for something

Be concise and helpful. Cite sources when using search results.`,

    tools: exaTools,

    stopWhen: stepCountIs(10),
  })

  return {
    agent,
    close: async () => {
      await exaClient.close()
    },
  }
}

export type AssistantMessage = InferAgentUIMessage<
  Awaited<ReturnType<typeof createAssistantAgent>>["agent"]
>

