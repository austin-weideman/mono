export interface RecordUsageEventInput {
  userId: string;
  conversationId: string;
  generationId: string;
  gatewayModelId: string;
  costUsd: string | null;
}
