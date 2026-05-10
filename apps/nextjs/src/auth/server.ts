import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { nextCookies } from "better-auth/next-js";

import { initAuth } from "@microlearn/auth";
import {
  ExistingUserSignupAttemptEmail,
  sendEmail,
  VerifyEmail,
} from "@microlearn/email";

import { env } from "~/env";

export const auth = initAuth({
  baseUrl: env.AUTH_BASE_URL,
  productionUrl: env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined,
  secret: env.AUTH_SECRET,
  useOauthProxy: !!env.VERCEL_ENV && !!env.VERCEL_PROJECT_PRODUCTION_URL,
  googleClientId: env.AUTH_GOOGLE_ID,
  googleClientSecret: env.AUTH_GOOGLE_SECRET,
  sendVerificationEmail: async ({ user, url, token }) => {
    await sendEmail({
      to: user.email,
      subject: "Verify your MicroLearn email",
      react: VerifyEmail({ name: user.name, url }),
      idempotencyKey: `verify-email:${user.id}:${token}`,
      tags: { category: "verify_email" },
    });
  },
  onExistingUserSignUp: async ({ user }) => {
    await sendEmail({
      to: user.email,
      subject: "Sign-up attempt with your email",
      react: ExistingUserSignupAttemptEmail({ email: user.email }),
      idempotencyKey: `existing-user-signup:${user.id}`,
      tags: { category: "existing_user_signup_attempt" },
    });
  },
  extraPlugins: [nextCookies()],
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
