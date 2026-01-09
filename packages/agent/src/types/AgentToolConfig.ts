import type { ExternalToolSet } from "./ExternalToolSet";
import type { InternalTool } from "./InternalTool";

export interface AgentToolConfig {
  internal: InternalTool[];
  external: ExternalToolSet[];
}
