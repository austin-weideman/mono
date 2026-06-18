import type {
  Campaign as DbCampaign,
  ExperimentRun as DbExperimentRun,
} from "@mono/db";

export type Campaign = DbCampaign;
export type ExperimentRun = DbExperimentRun;

// A campaign plus its best true result so far (highest measured conversion
// across its runs), computed at query time. null when no experiments have run.
export interface CampaignWithBest {
  campaign: Campaign;
  bestValue: number | null;
  runCount: number;
}
