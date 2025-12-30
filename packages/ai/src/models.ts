export type ModelProvider = "anthropic" | "google" | "xai" | "openai";

export interface ModelConfig {
  gatewayId: string;
  provider: ModelProvider;
  displayName: string;
}

export const ModelId = {
  CLAUDE_HAIKU_4_5: "claude-haiku-4.5",
  CLAUDE_SONNET_4_5: "claude-sonnet-4.5",
  CLAUDE_OPUS_4_5: "claude-opus-4.5",
  GEMINI_2_5_FLASH: "gemini-2.5-flash",
  GEMINI_2_5_PRO: "gemini-2.5-pro",
  GEMINI_3_FLASH: "gemini-3-flash",
  GEMINI_3_PRO_PREVIEW: "gemini-3-pro-preview",
  GROK_4_FAST: "grok-4-fast",
  GROK_4_1_FAST: "grok-4.1-fast",
  GPT_5_2: "gpt-5.2",
  GPT_5: "gpt-5",
  GPT_5_MINI: "gpt-5-mini",
} as const;

export type ModelId = (typeof ModelId)[keyof typeof ModelId];

export const MODEL_REGISTRY: Record<ModelId, ModelConfig> = {
  [ModelId.CLAUDE_HAIKU_4_5]: {
    gatewayId: "anthropic/claude-haiku-4.5",
    provider: "anthropic",
    displayName: "Claude Haiku 4.5",
  },
  [ModelId.CLAUDE_SONNET_4_5]: {
    gatewayId: "anthropic/claude-sonnet-4.5",
    provider: "anthropic",
    displayName: "Claude Sonnet 4.5",
  },
  [ModelId.CLAUDE_OPUS_4_5]: {
    gatewayId: "anthropic/claude-opus-4.5",
    provider: "anthropic",
    displayName: "Claude Opus 4.5",
  },
  [ModelId.GEMINI_2_5_FLASH]: {
    gatewayId: "google/gemini-2.5-flash",
    provider: "google",
    displayName: "Gemini 2.5 Flash",
  },
  [ModelId.GEMINI_2_5_PRO]: {
    gatewayId: "google/gemini-2.5-pro",
    provider: "google",
    displayName: "Gemini 2.5 Pro",
  },
  [ModelId.GEMINI_3_FLASH]: {
    gatewayId: "google/gemini-3-flash",
    provider: "google",
    displayName: "Gemini 3 Flash",
  },
  [ModelId.GEMINI_3_PRO_PREVIEW]: {
    gatewayId: "google/gemini-3-pro-preview",
    provider: "google",
    displayName: "Gemini 3 Pro Preview",
  },
  [ModelId.GROK_4_FAST]: {
    gatewayId: "xai/grok-4-fast-non-reasoning",
    provider: "xai",
    displayName: "Grok 4 Fast Non-Reasoning",
  },
  [ModelId.GROK_4_1_FAST]: {
    gatewayId: "xai/grok-4.1-fast-reasoning",
    provider: "xai",
    displayName: "Grok 4.1 Fast Reasoning",
  },
  [ModelId.GPT_5_2]: {
    gatewayId: "openai/gpt-5.2",
    provider: "openai",
    displayName: "GPT-5.2",
  },
  [ModelId.GPT_5]: {
    gatewayId: "openai/gpt-5",
    provider: "openai",
    displayName: "GPT-5",
  },
  [ModelId.GPT_5_MINI]: {
    gatewayId: "openai/gpt-5-mini",
    provider: "openai",
    displayName: "GPT-5 Mini",
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

export function isValidModelId(value: string): value is ModelId {
  return Object.values(ModelId).includes(value as ModelId);
}
