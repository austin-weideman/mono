import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy } from "better-auth/plugins";

import { db } from "@microlearn/db/client";

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
  baseUrl: string;
  productionUrl: string | undefined;
  secret: string | undefined;
  useOauthProxy: boolean;

  googleClientId?: string;
  googleClientSecret?: string;
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
    ],
    socialProviders: {
      ...(options.googleClientId &&
        options.googleClientSecret && {
          google: {
            clientId: options.googleClientId,
            clientSecret: options.googleClientSecret,
          },
        }),
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
