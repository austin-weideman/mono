import type { Tool } from "ai";

import type { InternalTool, ToolContext, ToolMetadata } from "../../types";
import { InternalTool as InternalToolEnum } from "../../types";
import {
  createGetMyUserInfoTool,
  GET_MY_USER_INFO_METADATA,
} from "./user";

interface InternalToolDefinition {
  metadata: ToolMetadata;
  create: (context: ToolContext) => Tool;
}

export const INTERNAL_TOOL_REGISTRY: Record<InternalTool, InternalToolDefinition> = {
  [InternalToolEnum.GET_MY_USER_INFO]: {
    metadata: GET_MY_USER_INFO_METADATA,
    create: createGetMyUserInfoTool,
  },
};
