export type MCPTransportType = "http" | "sse"

export interface MCPServerConfig {
  name: string
  url: string
  type: MCPTransportType
  headers?: Record<string, string>
}

export const mcpServers = {
  exa: {
    name: "exa",
    url: "https://mcp.exa.ai/mcp",
    type: "http",
  },
} as const satisfies Record<string, MCPServerConfig>

export type MCPServerName = keyof typeof mcpServers

