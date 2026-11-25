import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { nextCookies } from "better-auth/next-js";

import { initAuth } from "@mono/auth";
import {
  ExistingUserSignupAttemptEmail,
  sendEmail,
  VerifyEmail,
} from "@mono/email";

import { env } from "~/env";
import { redisSecondaryStorage } from "./redis-secondary-storage";

// Dev AUTH_BASE_URL is the ngrok URL Google redirects to; this also allows localhost.
const LOCAL_DEV_ORIGIN = "http://localhost:3000";

export const auth = initAuth({
  baseUrl: env.AUTH_BASE_URL,
  trustedOrigins: env.NODE_ENV === "development" ? [LOCAL_DEV_ORIGIN] : [],
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
      subject: "Verify your Autolab email",
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
  secondaryStorage: redisSecondaryStorage,
  extraPlugins: [nextCookies()],
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
