import type { LanguageModel, streamText, ToolSet } from "ai";

export type ChatAgentProviderOptions = Parameters<
  typeof streamText
>[0]["providerOptions"];

// Everything one agent needs for a model call. The turn runner owns the loop.
export interface ChatAgent {
  model: LanguageModel;
  instructions: string;
  tools: ToolSet;
  providerOptions: ChatAgentProviderOptions;
  maxSteps: number;
  close: () => Promise<void>;
}
