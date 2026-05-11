import {
  deleteConversation,
  deleteConversationInputSchema,
  listUserConversations,
  listUserConversationsInputSchema,
  loadConversation,
  loadConversationInputSchema,
  startConversation,
} from "@mono/conversation";
import { userActor } from "@mono/core-types";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const conversationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listUserConversationsInputSchema.omit({ userId: true }).optional())
    .query(async ({ ctx, input }) => {
      return await listUserConversations(
        ctx.db,
        userActor(ctx.session.user.id),
        {
          userId: ctx.session.user.id,
          limit: input?.limit,
          cursor: input?.cursor,
        },
      );
    }),

  load: protectedProcedure
    .input(loadConversationInputSchema)
    .query(async ({ ctx, input }) => {
      return await loadConversation(ctx.db, userActor(ctx.session.user.id), {
        conversationId: input.conversationId,
      });
    }),

  start: protectedProcedure.mutation(async ({ ctx }) => {
    return await startConversation(ctx.db, userActor(ctx.session.user.id), {
      userId: ctx.session.user.id,
    });
  }),

  delete: protectedProcedure
    .input(deleteConversationInputSchema)
    .mutation(async ({ ctx, input }) => {
      await deleteConversation(ctx.db, userActor(ctx.session.user.id), {
        conversationId: input.conversationId,
      });
      return { success: true };
    }),
});
