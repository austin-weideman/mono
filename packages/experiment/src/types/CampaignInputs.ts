import { z } from "zod";

export const getCampaignInputSchema = z.object({
  campaignId: z.uuid(),
});
export type GetCampaignInput = z.infer<typeof getCampaignInputSchema>;

export const listExperimentRunsInputSchema = z.object({
  campaignId: z.uuid(),
});
export type ListExperimentRunsInput = z.infer<
  typeof listExperimentRunsInputSchema
>;
