import {
  deleteAttachment,
  deleteAttachmentInputSchema,
} from "@mono/attachment";
import { userActor } from "@mono/core-types";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const attachmentRouter = createTRPCRouter({
  delete: protectedProcedure
    .input(deleteAttachmentInputSchema)
    .mutation(async ({ ctx, input }) => {
      await deleteAttachment(ctx.db, userActor(ctx.session.user.id), {
        attachmentId: input.attachmentId,
      });
      return { success: true };
    }),
});
