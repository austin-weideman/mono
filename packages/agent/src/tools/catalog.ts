import type { ToolMetadata } from "./types";
import { USER_TOOL_METADATA } from "./user";

export const TOOL_CATALOG: Record<string, ToolMetadata> = {
  ...USER_TOOL_METADATA,
};

export function generateToolInstructions(): string {
  const toolEntries = Object.values(TOOL_CATALOG);

  if (toolEntries.length === 0) {
    return "";
  }

  const toolDescriptions = toolEntries
    .map((meta) => `- ${meta.name}: ${meta.description} ${meta.usage}`)
    .join("\n");

  return `You have access to the following tools:\n${toolDescriptions}`;
}
