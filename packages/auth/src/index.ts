import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy } from "better-auth/plugins";

import { db } from "@microlearn/db/client";

type EmailVerificationOptions = NonNullable<
  BetterAuthOptions["emailVerification"]
>;
type EmailAndPasswordOptions = NonNullable<
  BetterAuthOptions["emailAndPassword"]
>;

export type SendVerificationEmail = NonNullable<
  EmailVerificationOptions["sendVerificationEmail"]
>;
export type OnExistingUserSignUp = NonNullable<
  EmailAndPasswordOptions["onExistingUserSignUp"]
>;

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
  baseUrl: string;
  productionUrl: string | undefined;
  secret: string | undefined;
  useOauthProxy: boolean;

  googleClientId?: string;
  googleClientSecret?: string;

  /**
   * Email-delivery callbacks. The auth package stays generic so the Better
   * Auth CLI (`script/auth-cli.ts`) can generate the schema without needing
   * email infrastructure or env vars; consumers wire these up at runtime.
   */
  sendVerificationEmail?: SendVerificationEmail;
  onExistingUserSignUp?: OnExistingUserSignUp;

  extraPlugins?: TExtraPlugins;
}) {
  if (options.useOauthProxy && !options.productionUrl) {
    throw new Error(
      "productionUrl must be set when useOauthProxy is true (set VERCEL_PROJECT_PRODUCTION_URL)",
    );
  }

  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins: [
      ...(options.useOauthProxy && options.productionUrl
        ? [oAuthProxy({ productionURL: options.productionUrl })]
        : []),
      expo(),
      ...(options.extraPlugins ?? []),
    ] as BetterAuthPlugin[],
    socialProviders: {
      ...(options.googleClientId &&
        options.googleClientSecret && {
          google: {
            clientId: options.googleClientId,
            clientSecret: options.googleClientSecret,
          },
        }),
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      ...(options.onExistingUserSignUp && {
        onExistingUserSignUp: options.onExistingUserSignUp,
      }),
    },
    ...(options.sendVerificationEmail && {
      emailVerification: {
        sendVerificationEmail: options.sendVerificationEmail,
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
      },
    }),
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },
    trustedOrigins: ["expo://", "exp://"],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
