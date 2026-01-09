import type { ExternalToolSet } from "../../types";
import type { ExaToolsResult } from "./exa";
import { ExternalToolSet as ExternalToolSetEnum } from "../../types";
import { createExaTools } from "./exa";

type ExternalToolSetFactory = () => Promise<ExaToolsResult>;

export const EXTERNAL_TOOL_SET_REGISTRY: Record<ExternalToolSet, ExternalToolSetFactory> = {
  [ExternalToolSetEnum.EXA]: createExaTools,
};
