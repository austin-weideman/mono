import type { Campaign } from "../types/Campaign";
import type { ParameterSpace, ParameterValues } from "../types/ParameterSpace";
import { space } from "../environment/space";
import { buildNameAblation } from "../utils/nameAblation";

export interface PresentedEnvironment {
  // The space the agent is shown: real names, or name-ablated under hideNames.
  presentedSpace: ParameterSpace;
  // Converts the agent's proposal (in the presented namespace) back to real
  // params for lookup and persistence. Identity when names are not hidden.
  toRealParams: (params: ParameterValues) => ParameterValues;
}

export function presentEnvironment(
  campaign: Pick<Campaign, "environmentKey" | "hideNames">,
): PresentedEnvironment {
  const realSpace = space(campaign.environmentKey);

  if (!campaign.hideNames) {
    return { presentedSpace: realSpace, toRealParams: (params) => params };
  }

  const ablation = buildNameAblation(realSpace);
  return {
    presentedSpace: ablation.ablatedSpace,
    toRealParams: ablation.toReal,
  };
}
