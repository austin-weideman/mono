import type { ToolContext } from "../types";
import { createUserTools } from "./user";

export { TOOL_CATALOG, generateToolInstructions } from "./catalog";
export type { ToolMetadata } from "./types";
export { USER_TOOL_METADATA, UserToolName } from "./user";

export function createInternalTools(context: ToolContext) {
  return {
    ...createUserTools(context),
  };
}
