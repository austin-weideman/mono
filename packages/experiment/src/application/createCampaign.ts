import type { Actor } from "@mono/core-types";
import type { DbOrTx } from "@mono/db/client";
import { MAX_AGENT_STEPS } from "@mono/agent";
import { startConversation } from "@mono/conversation";
import { isUserActor } from "@mono/core-types";
import { BadRequestError } from "@mono/errors";

import type { Campaign } from "../types/Campaign";
import type { CreateCampaignInput } from "../types/CreateCampaignInput";
import { isKnownEnvironment } from "../environment/space";
import { insertCampaign } from "../persistence/campaign.mutations";

const DEFAULT_TITLE = "New Campaign";
// 31-bit so it fits a postgres integer column comfortably.
const SEED_MAX = 0x7fffffff;

function randomSeed(): number {
  return Math.floor(Math.random() * SEED_MAX) + 1;
}

// Creates the conversation and the campaign together — the campaign IS the
// conversation. Validates the environment and that the budget leaves a step for
// the closing summary (strict `<` MAX_AGENT_STEPS).
export async function createCampaign(
  db: DbOrTx,
  actor: Actor,
  input: CreateCampaignInput,
): Promise<Campaign> {
  if (isUserActor(actor) && actor.userId !== input.userId) {
    throw new BadRequestError("Cannot create a campaign for another user");
  }

  if (!isKnownEnvironment(input.environmentKey)) {
    throw new BadRequestError(`Unknown environment: ${input.environmentKey}`);
  }

  if (input.maxIterations <= 0 || input.maxIterations >= MAX_AGENT_STEPS) {
    throw new BadRequestError(
      `maxIterations must be between 1 and ${MAX_AGENT_STEPS - 1}`,
    );
  }

  // The seed IS the scramble-mode flag: explicit seed wins (reproducible
  // study runs); otherwise mint one only when the UI toggle is on.
  const scrambleSeed =
    input.scrambleSeed ?? (input.scramble ? randomSeed() : null);

  const title = input.title ?? DEFAULT_TITLE;

  return await db.transaction(async (tx) => {
    const conversation = await startConversation(tx, actor, {
      userId: input.userId,
      title,
    });

    return await insertCampaign(tx, {
      userId: input.userId,
      conversationId: conversation.id,
      title,
      environmentKey: input.environmentKey,
      supervised: input.supervised,
      hideNames: input.hideNames,
      maxIterations: input.maxIterations,
      scrambleSeed,
    });
  });
}
