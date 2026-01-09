import type { ToolSet } from "ai";

import { createSingleMCPClient, mcpServers } from "@microlearn/ai";

export interface ExaToolsResult {
  tools: ToolSet;
  close: () => Promise<void>;
}

export async function createExaTools(): Promise<ExaToolsResult> {
  const client = await createSingleMCPClient(mcpServers.exa);
  const tools = (await client.tools()) as ToolSet;

  return {
    tools,
    close: () => client.close(),
  };
}
