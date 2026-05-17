import { z } from "zod";

import { getUserConversationSpend } from "@mono/billing";
import { userActor } from "@mono/core-types";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const billingRouter = createTRPCRouter({
  conversationSpend: protectedProcedure
    .input(z.object({ conversationId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const totalUsd = await getUserConversationSpend(
        ctx.db,
        userActor(ctx.session.user.id),
        {
          userId: ctx.session.user.id,
          conversationId: input.conversationId,
        },
      );
      return { totalUsd };
    }),
});
