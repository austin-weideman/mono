import { userActor } from "@mono/core-types";
import {
  createCampaign,
  createCampaignInputSchema,
  getCampaign,
  getCampaignInputSchema,
  listCampaigns,
  listExperimentRuns,
  listExperimentRunsInputSchema,
} from "@mono/experiment";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const experimentRouter = createTRPCRouter({
  // Creates the lab conversation and the campaign row together.
  createCampaign: protectedProcedure
    .input(createCampaignInputSchema.omit({ userId: true }))
    .mutation(async ({ ctx, input }) => {
      return await createCampaign(ctx.db, userActor(ctx.session.user.id), {
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  // Each campaign plus its best result so far (MAX over runs at query time).
  listCampaigns: protectedProcedure.query(async ({ ctx }) => {
    return await listCampaigns(ctx.db, userActor(ctx.session.user.id), {
      userId: ctx.session.user.id,
    });
  }),

  getCampaign: protectedProcedure
    .input(getCampaignInputSchema)
    .query(async ({ ctx, input }) => {
      return await getCampaign(ctx.db, userActor(ctx.session.user.id), {
        campaignId: input.campaignId,
      });
    }),

  // The experiment rows for one campaign — what the chart plots.
  listExperimentRuns: protectedProcedure
    .input(listExperimentRunsInputSchema)
    .query(async ({ ctx, input }) => {
      return await listExperimentRuns(ctx.db, userActor(ctx.session.user.id), {
        campaignId: input.campaignId,
      });
    }),
});
