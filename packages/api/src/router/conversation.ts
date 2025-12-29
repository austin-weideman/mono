import { z } from "zod";

import { userActor } from "@microlearn/core-types";
import {
  listUserConversations,
  loadConversation,
  startConversation,
} from "@microlearn/conversation";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const conversationRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await listUserConversations(
      ctx.db,
      userActor(ctx.session.user.id),
      { userId: ctx.session.user.id },
    );
  }),

  load: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await loadConversation(
        ctx.db,
        userActor(ctx.session.user.id),
        { conversationId: input.conversationId },
      );
    }),

  start: protectedProcedure.mutation(async ({ ctx }) => {
    return await startConversation(
      ctx.db,
      userActor(ctx.session.user.id),
      { userId: ctx.session.user.id },
    );
  }),
});

