import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { and, eq, isNotNull } from "drizzle-orm";
import { z } from "zod/v4";

import type { DbOrTx } from "@mono/db/client";
import { account } from "@mono/db";

import { protectedProcedure, publicProcedure } from "../trpc";

const CREDENTIAL_PROVIDER_ID = "credential";
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

async function userHasCredentialPassword(
  db: DbOrTx,
  userId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: account.id })
    .from(account)
    .where(
      and(
        eq(account.userId, userId),
        eq(account.providerId, CREDENTIAL_PROVIDER_ID),
        isNotNull(account.password),
      ),
    )
    .limit(1);

  return !!row;
}

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),

  hasPassword: protectedProcedure.query(async ({ ctx }) => {
    const hasPassword = await userHasCredentialPassword(
      ctx.db,
      ctx.session.user.id,
    );
    return { hasPassword };
  }),

  setPassword: protectedProcedure
    .input(
      z.object({
        newPassword: z
          .string()
          .min(MIN_PASSWORD_LENGTH, "Use at least 8 characters.")
          .max(MAX_PASSWORD_LENGTH, "Keep your password under 72 characters."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const alreadyHasPassword = await userHasCredentialPassword(
        ctx.db,
        ctx.session.user.id,
      );
      if (alreadyHasPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "A password is already set on this account. Use the change-password flow instead.",
        });
      }

      try {
        await ctx.authApi.setPassword({
          body: { newPassword: input.newPassword },
          headers: ctx.headers,
        });
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Failed to set password.";
        throw new TRPCError({
          code: "BAD_REQUEST",
          message,
          cause,
        });
      }

      return { success: true };
    }),
} satisfies TRPCRouterRecord;
