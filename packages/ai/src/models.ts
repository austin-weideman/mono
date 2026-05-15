export type ModelProvider =
  | "anthropic"
  | "google"
  | "xai"
  | "openai"
  | "deepseek";

export const PROVIDER_DISPLAY_NAMES: Record<ModelProvider, string> = {
  anthropic: "Anthropic",
  google: "Google",
  xai: "xAI",
  openai: "OpenAI",
  deepseek: "DeepSeek",
} as const;

export interface ModelConfig {
  gatewayId: string;
  provider: ModelProvider;
  displayName: string;
  contextWindowTokens: number;
}

export const ModelId = {
  CLAUDE_SONNET_4_6: "claude-sonnet-4.6",
  CLAUDE_HAIKU_4_5: "claude-haiku-4.5",
  GPT_5_4: "gpt-5.4",
  GPT_5_4_MINI: "gpt-5.4-mini",
} as const;

export type ModelId = (typeof ModelId)[keyof typeof ModelId];

export const MODEL_REGISTRY: Record<ModelId, ModelConfig> = {
  [ModelId.CLAUDE_SONNET_4_6]: {
    gatewayId: "anthropic/claude-sonnet-4.6",
    provider: "anthropic",
    displayName: "Claude Sonnet 4.6",
    contextWindowTokens: 1000000,
  },
  [ModelId.CLAUDE_HAIKU_4_5]: {
    gatewayId: "anthropic/claude-haiku-4.5",
    provider: "anthropic",
    displayName: "Claude Haiku 4.5",
    contextWindowTokens: 200000,
  },
  [ModelId.GPT_5_4]: {
    gatewayId: "openai/gpt-5.4",
    provider: "openai",
    displayName: "GPT 5.4",
    contextWindowTokens: 1100000,
  },
  [ModelId.GPT_5_4_MINI]: {
    gatewayId: "openai/gpt-5.4-mini",
    provider: "openai",
    displayName: "GPT 5.4 Mini",
    contextWindowTokens: 400000,
  },
} as const;

export function getModelConfig(modelId: ModelId): ModelConfig {
  return MODEL_REGISTRY[modelId];
}

export function getGatewayId(modelId: ModelId): string {
  return MODEL_REGISTRY[modelId].gatewayId;
}

export function getAllModelIds(): ModelId[] {
  return Object.values(ModelId);
}

export function getModelsByProvider(provider: ModelProvider): ModelId[] {
  return getAllModelIds().filter(
    (id) => MODEL_REGISTRY[id].provider === provider,
  );
}

export function getModelsGroupedByProvider(): {
  anthropic: ModelId[];
  google: ModelId[];
  xai: ModelId[];
  openai: ModelId[];
  deepseek: ModelId[];
} {
  return {
    anthropic: getModelsByProvider("anthropic"),
    google: getModelsByProvider("google"),
    xai: getModelsByProvider("xai"),
    openai: getModelsByProvider("openai"),
    deepseek: getModelsByProvider("deepseek"),
  };
}

export function isValidModelId(value: string): value is ModelId {
  return Object.values(ModelId).includes(value as ModelId);
}
