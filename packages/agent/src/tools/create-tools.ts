import type { ToolSet } from "ai";

import type { AgentToolConfig, ToolContext, ToolMetadata } from "../types";
import { INTERNAL_TOOL_REGISTRY } from "./internal";

export interface CreateToolsResult {
  tools: ToolSet;
  metadata: ToolMetadata[];
  close: () => Promise<void>;
}

export function createTools(
  context: ToolContext,
  config: AgentToolConfig,
): CreateToolsResult {
  const tools: ToolSet = {};
  const metadata: ToolMetadata[] = [];

  for (const toolName of config.internal) {
    const definition = INTERNAL_TOOL_REGISTRY[toolName];
    tools[toolName] = definition.create(context);
    metadata.push(definition.metadata);
  }

  return {
    tools,
    metadata,
    close: async () => {
      // No external resources to release.
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
