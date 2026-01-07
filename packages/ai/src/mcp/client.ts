import { createMCPClient } from "@ai-sdk/mcp"

import type { MCPServerConfig } from "./servers"

type MCPClient = Awaited<ReturnType<typeof createMCPClient>>

export interface MCPToolProvider {
  tools: Record<string, unknown>
  close: () => Promise<void>
}

export async function createMCPToolProvider(
  servers: MCPServerConfig[],
): Promise<MCPToolProvider> {
  const clients: MCPClient[] = []

  for (const server of servers) {
    const client = await createMCPClient({
      transport: {
        type: server.type,
        url: server.url,
        headers: server.headers,
      },
    })
    clients.push(client)
  }

  const allTools: Record<string, unknown> = {}

  for (const client of clients) {
    const tools = await client.tools()
    Object.assign(allTools, tools)
  }

  return {
    tools: allTools,
    close: async () => {
      await Promise.all(clients.map((c) => c.close()))
    },
  }
}

export async function createSingleMCPClient(
  config: MCPServerConfig,
): Promise<MCPClient> {
  return await createMCPClient({
    transport: {
      type: config.type,
      url: config.url,
      headers: config.headers,
    },
  })
}

