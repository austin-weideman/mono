import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { loadConversation, toTurnSnapshot } from "@mono/conversation";
import { userActor } from "@mono/core-types";
import { db } from "@mono/db/client";
import { ForbiddenError, NotFoundError } from "@mono/errors";
import { getCampaign, space } from "@mono/experiment";

import { getSession } from "~/auth/server";
import { LabCampaign } from "../_components/lab-campaign";
import { getSelectedModelId } from "../../_lib/model";

interface LabCampaignPageProps {
  params: Promise<{ id: string }>;
}

export default async function LabCampaignPage({
  params,
}: LabCampaignPageProps) {
  const [session, cookieStore] = await Promise.all([getSession(), cookies()]);
  if (!session) {
    redirect("/");
  }

  const { id } = await params;
  const selectedModelId = getSelectedModelId(cookieStore);
  const actor = userActor(session.user.id);

  let campaign;
  try {
    campaign = await getCampaign(db, actor, { campaignId: id });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      notFound();
    }
    throw error;
  }

  const { messages, latestTurn } = await loadConversation(db, actor, {
    conversationId: campaign.conversationId,
  });

  const objective = space(campaign.environmentKey).objective;

  return (
    <LabCampaign
      campaignId={campaign.id}
      conversationId={campaign.conversationId}
      title={campaign.title ?? "Campaign"}
      supervised={campaign.supervised}
      hideNames={campaign.hideNames}
      scrambled={campaign.scrambleSeed != null}
      maxIterations={campaign.maxIterations}
      objectiveLabel={objective.label}
      objectiveMax={objective.max}
      initialMessages={messages}
      initialTurn={latestTurn ? toTurnSnapshot(latestTurn) : null}
      selectedModelId={selectedModelId}
    />
  );
}
