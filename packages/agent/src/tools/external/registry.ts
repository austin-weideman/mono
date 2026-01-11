import type { ExternalToolSet } from "../../types";
import type { ExaToolsResult } from "./exa";
import { ExternalToolSet as ExternalToolSetEnum } from "../../types";
import { createExaTools } from "./exa";

/**
 * WARNING: Tool names are persisted in message history.
 *
 * External tool names (from MCP servers) are stored in message parts when used.
 * If an external tool is renamed upstream, old messages will still reference
 * the old name. See internal/registry.ts for migration guidance.
 */

type ExternalToolSetFactory = () => Promise<ExaToolsResult>;

export const EXTERNAL_TOOL_SET_REGISTRY: Record<ExternalToolSet, ExternalToolSetFactory> = {
  [ExternalToolSetEnum.EXA]: createExaTools,
};
