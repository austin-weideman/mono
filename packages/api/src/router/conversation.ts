import { z } from "zod";

import {
  listUserConversations,
  loadConversation,
  startConversation,
} from "@microlearn/conversation";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const conversationRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await listUserConversations(ctx.db, {
      userId: ctx.session.user.id,
    });
  }),

  load: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await loadConversation(ctx.db, {
        conversationId: input.conversationId,
        userId: ctx.session.user.id,
      });
    }),

  start: protectedProcedure.mutation(async ({ ctx }) => {
    return await startConversation(ctx.db, {
      userId: ctx.session.user.id,
    });
  }),
});

