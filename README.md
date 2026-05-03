# MicroLearn

An AI-powered microlearning app that teaches new concepts through 5–10 minute daily lessons in an interactive chat interface.

See [AGENTS.md](./AGENTS.md) for the full project overview, architectural rules, and conventions for AI agents working in this repo.

## Repo Layout

A [Turborepo](https://turborepo.com) monorepo:

```text
apps
  ├─ expo                  # React Native (Expo SDK 54, RN 0.81, NativeWind)
  └─ nextjs                # Next.js 16 (App Router) — marketing site + API
packages
  ├─ agent                 # Agent orchestration
  ├─ ai                    # Vercel AI SDK wrappers
  ├─ api                   # tRPC v11 routers
  ├─ auth                  # Better Auth setup
  ├─ chat-utils            # Shared chat helpers
  ├─ conversation          # Conversation feature package
  ├─ core-types            # Shared types (Actor, etc.)
  ├─ db                    # Drizzle schema + Postgres client (Neon)
  ├─ env                   # Type-safe env-var validation
  ├─ errors                # Domain error types
  ├─ jobs                  # Inngest client + job registry
  ├─ testing               # Test helpers
  ├─ time                  # Time utilities
  ├─ ui                    # Shared React/RN components (shadcn-ui base)
  ├─ user                  # User feature package
  └─ validators            # Shared Zod schemas
tooling
  ├─ eslint                # Shared ESLint presets
  ├─ github                # Shared GitHub Actions
  ├─ prettier              # Shared Prettier config
  ├─ tailwind              # Shared Tailwind theme
  └─ typescript            # Shared tsconfig
```

## Quick Start

> All commands require Doppler. The repo uses an alias: `alias d='doppler run -- pnpm'`. See [AGENTS.md](./AGENTS.md#environment-variables-doppler) for details.

### 1. Install dependencies

```bash
pnpm i
```

### 2. Set up the database

```bash
# Push the Drizzle schema to your database
cd packages/db
d push
```

### 3. Generate the Better Auth schema

This project uses [Better Auth](https://www.better-auth.com) for authentication. The auth schema needs to be generated using the Better Auth CLI before you can use the authentication features.

```bash
pnpm --filter @microlearn/auth generate
```

This command runs the Better Auth CLI with the following configuration:

- **Config file**: `packages/auth/script/auth-cli.ts` — A CLI-only configuration file (isolated from src to prevent imports)
- **Output**: `packages/db/src/auth-schema.ts` — Generated Drizzle schema for authentication tables

The generation process:

1. Reads the Better Auth configuration from `packages/auth/script/auth-cli.ts`
2. Generates the appropriate database schema based on your auth setup
3. Outputs a Drizzle-compatible schema file to the `@microlearn/db` package

> **Note**: The `auth-cli.ts` file is placed in the `script/` directory (instead of `src/`) to prevent accidental imports from other parts of the codebase. This file is exclusively for CLI schema generation and should **not** be used directly in your application. For runtime authentication, use the configuration from `packages/auth/src/index.ts`.

For more information about the Better Auth CLI, see the [official documentation](https://www.better-auth.com/docs/concepts/cli#generate).

### 4. Run the dev servers

```bash
# Web app + API
d dev

# Ngrok server
ngrok http 3000

# In a second terminal: Inngest dev server (auto-discovers /api/inngest)
pnpm inngest:dev
```

The Inngest dev server lives at `http://localhost:8288`.

## Expo Setup

### Use iOS Simulator

1. Make sure you have XCode and XCommand Line Tools installed [as shown on expo docs](https://docs.expo.dev/workflow/ios-simulator).

   > **NOTE:** If you just installed XCode, or if you have updated it, you need to open the simulator manually once. Run `npx expo start` from `apps/expo`, and then enter `I` to launch Expo Go. After the manual launch, you can run `pnpm dev` in the root directory.

   ```diff
   +  "dev": "expo start --ios",
   ```

2. Run `pnpm dev` at the project root folder.

### Use Android Emulator

1. Install Android Studio tools [as shown on expo docs](https://docs.expo.dev/workflow/android-studio-emulator).

2. Change the `dev` script at `apps/expo/package.json` to open the Android emulator.

   ```diff
   +  "dev": "expo start --android",
   ```

3. Run `pnpm dev` at the project root folder.

### Configuring Better-Auth to work with Expo

In order to get Better-Auth to work with Expo, you must either:

#### Deploy the Auth Proxy (RECOMMENDED)

Better-auth comes with an [auth proxy plugin](https://www.better-auth.com/docs/plugins/oauth-proxy). By deploying the Next.js app, you can get OAuth working in preview deployments and development for Expo apps.

By using the proxy plugin, the Next.js apps will forward any auth requests to the proxy server, which will handle the OAuth flow and then redirect back to the Next.js app. This makes it easy to get OAuth working since you'll have a stable URL that is publicly accessible and doesn't change for every deployment and doesn't rely on what port the app is running on. So if port 3000 is taken and your Next.js app starts at port 3001 instead, your auth should still work without having to reconfigure the OAuth provider.

#### Add your local IP to your OAuth provider

You can alternatively add your local IP (e.g. `192.168.x.y:$PORT`) to your OAuth provider. This may not be as reliable as your local IP may change when you change networks. Some OAuth providers may also only support a single callback URL for each app making this approach unviable for some providers (e.g. GitHub).

## Common Tasks

### Adding a new UI component

Run the `ui-add` script to add a new UI component using the interactive `shadcn/ui` CLI:

```bash
pnpm ui-add
```

When the component(s) has been installed, you should be good to go and start using it in your app.

### Adding a new package

To add a new package, simply run `pnpm turbo gen init` in the monorepo root. This will prompt you for a package name as well as if you want to install any dependencies to the new package (of course you can also do this yourself later).

The generator sets up the `package.json`, `tsconfig.json` and an `index.ts`, as well as configures all the necessary configurations for tooling around your package such as formatting, linting and typechecking.

### Adding a new background job

See the [Background Jobs (Inngest)](./AGENTS.md#background-jobs-inngest) section in `AGENTS.md`.

## Deployment

### Next.js

> **Note**: The Next.js application with tRPC must be deployed in order for the Expo app to communicate with the server in a production environment.

Deploys are orchestrated by GitHub Actions (Vercel auto-deploy is disabled). See the [CI/CD](./AGENTS.md#cicd) section in `AGENTS.md`.

#### Auth Proxy

The auth proxy comes as a Better Auth plugin. This is required for the Next.js app to be able to authenticate users in preview deployments. The auth proxy is not used for OAuth requests in production deployments. The easiest way to get it running is to deploy the Next.js app to Vercel.

### Expo

Deploying your Expo application works slightly differently compared to Next.js on the web. Instead of "deploying" your app online, you need to submit production builds of your app to app stores, like [Apple App Store](https://www.apple.com/app-store) and [Google Play](https://play.google.com/store/apps). You can read the full [guide to distributing your app](https://docs.expo.dev/distribution/introduction), including best practices, in the Expo docs.

1. Make sure to modify the `getBaseUrl` function in `apps/expo/src/utils/api.tsx` to point to your backend's production URL.

2. Let's start by setting up [EAS Build](https://docs.expo.dev/build/introduction), which is short for Expo Application Services. The build service helps you create builds of your app, without requiring a full native development setup. The commands below are a summary of [Creating your first build](https://docs.expo.dev/build/setup).

   ```bash
   # Install the EAS CLI
   pnpm add -g eas-cli

   # Log in with your Expo account
   eas login

   # Configure your Expo app
   cd apps/expo
   eas build:configure
   ```

3. After the initial setup, you can create your first build. You can build for Android and iOS platforms and use different [`eas.json` build profiles](https://docs.expo.dev/build-reference/eas-json) to create production builds or development, or test builds. Let's make a production build for iOS.

   ```bash
   eas build --platform ios --profile production
   ```

   > If you don't specify the `--profile` flag, EAS uses the `production` profile by default.

4. Now that you have your first production build, you can submit this to the stores. [EAS Submit](https://docs.expo.dev/submit/introduction) can help you send the build to the stores.

   ```bash
   eas submit --platform ios --latest
   ```

   > You can also combine build and submit in a single command, using `eas build ... --auto-submit`.

5. Before you can get your app in the hands of your users, you'll have to provide additional information to the app stores. This includes screenshots, app information, privacy policies, etc. _While still in preview_, [EAS Metadata](https://docs.expo.dev/eas/metadata) can help you with most of this information.

6. Once everything is approved, your users can finally enjoy your app. Let's say you spotted a small typo; you'll have to create a new build, submit it to the stores, and wait for approval before you can resolve this issue. In these cases, you can use EAS Update to quickly send a small bugfix to your users without going through this long process. Let's start by setting up EAS Update.

   The steps below summarize the [Getting started with EAS Update](https://docs.expo.dev/eas-update/getting-started/#configure-your-project) guide.

   ```bash
   # Add the `expo-updates` library to your Expo app
   cd apps/expo
   pnpm expo install expo-updates

   # Configure EAS Update
   eas update:configure
   ```

7. Before we can send out updates to your app, you have to create a new build and submit it to the app stores. For every change that includes native APIs, you have to rebuild the app and submit the update to the app stores. See steps 2 and 3.

8. Now that everything is ready for updates, let's create a new update for `production` builds. With the `--auto` flag, EAS Update uses your current git branch name and commit message for this update. See [How EAS Update works](https://docs.expo.dev/eas-update/how-eas-update-works/#publishing-an-update) for more information.

   ```bash
   cd apps/expo
   eas update --auto
   ```

   > Your OTA (Over The Air) updates must always follow the app store's rules. You can't change your app's primary functionality without getting app store approval. But this is a fast way to update your app for minor changes and bug fixes.

9. Done! Now that you have created your production build, submitted it to the stores, and installed EAS Update, you are ready for anything!

## FAQ

### Does this pattern leak backend code to my client applications?

No, it does not. The `api` package should only be a production dependency in the Next.js application where it's served. The Expo app, and all other apps you may add in the future, should only add the `api` package as a dev dependency. This lets you have full typesafety in your client applications, while keeping your backend code safe.

If you need to share runtime code between the client and server, such as input validation schemas, you can create a separate `shared` package for this and import it on both sides.
