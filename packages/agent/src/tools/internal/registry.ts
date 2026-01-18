import type { Tool } from "ai";

import type { InternalTool, ToolContext, ToolMetadata } from "../../types";
import { InternalTool as InternalToolEnum } from "../../types";
import { createGetCurrentTimeTool, GET_CURRENT_TIME_METADATA } from "./time";
import { createGetMyUserInfoTool, GET_MY_USER_INFO_METADATA } from "./user";

/**
 * WARNING: Tool names are persisted in message history.
 *
 * When the AI uses a tool, the tool name is stored in the message parts
 * (e.g., type: "tool-getMyUserInfo"). Renaming a tool will NOT update
 * existing messages, which could break UI code that checks tool types.
 *
 * If you must rename a tool, also create a database migration:
 * UPDATE message SET parts = REPLACE(parts::text, 'old-name', 'new-name')::jsonb
 * WHERE parts::text LIKE '%old-name%';
 */

interface InternalToolDefinition {
  metadata: ToolMetadata;
  create: (context: ToolContext) => Tool;
}

export const INTERNAL_TOOL_REGISTRY: Record<
  InternalTool,
  InternalToolDefinition
> = {
  [InternalToolEnum.GET_MY_USER_INFO]: {
    metadata: GET_MY_USER_INFO_METADATA,
    create: createGetMyUserInfoTool,
  },
  [InternalToolEnum.GET_CURRENT_TIME]: {
    metadata: GET_CURRENT_TIME_METADATA,
    create: createGetCurrentTimeTool,
  },
};
