import type { ToolSet } from "ai";

import type { AgentToolConfig, ToolContext, ToolMetadata } from "../types";
import { EXTERNAL_TOOL_SET_REGISTRY } from "./external";
import { INTERNAL_TOOL_REGISTRY } from "./internal";

export interface CreateToolsResult {
  tools: ToolSet;
  metadata: ToolMetadata[];
  close: () => Promise<void>;
}

export async function createTools(
  context: ToolContext,
  config: AgentToolConfig,
): Promise<CreateToolsResult> {
  const tools: ToolSet = {};
  const metadata: ToolMetadata[] = [];
  const closeFns: (() => Promise<void>)[] = [];

  for (const toolName of config.internal) {
    const definition = INTERNAL_TOOL_REGISTRY[toolName];
    tools[toolName] = definition.create(context);
    metadata.push(definition.metadata);
  }

  for (const toolSetName of config.external) {
    const factory = EXTERNAL_TOOL_SET_REGISTRY[toolSetName];
    const result = await factory();
    Object.assign(tools, result.tools);
    closeFns.push(result.close);
  }

  return {
    tools,
    metadata,
    close: async () => {
      await Promise.all(closeFns.map((fn) => fn()));
    },
  };
}

export function generateToolInstructions(toolMetadata: ToolMetadata[]): string {
  if (toolMetadata.length === 0) {
    return "";
  }

  const toolDescriptions = toolMetadata
    .map((meta) => `- ${meta.name}: ${meta.description} ${meta.usage}`)
    .join("\n");

  return `You have access to the following tools:\n${toolDescriptions}`;
}
