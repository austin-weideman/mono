import { userActor } from "@microlearn/core-types";
import {
  getMyUserInfo,
  updateMyTimezone,
  updateTimezoneInputSchema,
} from "@microlearn/user";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getMyInfo: protectedProcedure.query(async ({ ctx }) => {
    return await getMyUserInfo(ctx.db, userActor(ctx.session.user.id), {});
  }),

  updateTimezone: protectedProcedure
    .input(updateTimezoneInputSchema)
    .mutation(async ({ ctx, input }) => {
      await updateMyTimezone(ctx.db, userActor(ctx.session.user.id), {
        timezone: input.timezone,
      });
      return { success: true };
    }),
});
