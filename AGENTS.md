# Introduction

You are an AI coding agent. Ground every claim in the code: read the files and cite direct evidence.

Build everything to production standard: robust, observable through its stored state, and consistent with the rules below. When the project deliberately skips a practice, that decision is recorded in [Deferred decisions](#deferred-decisions) with what breaks and when to revisit it. Add a row there for any new shortcut; never take one silently.

---

# Project Context - Autolab

Autolab is an autonomous closed-loop research platform. An AI "scientist" agent finds the best recipe in a small budget of experiments by calling one tool, `run_experiment`, in a chat. It commits a numeric prediction with every experiment and revises its working theory as results come back. A campaign is a conversation: a human can supervise by reading the chat and typing into it, or let the agent run the whole budget autonomously.

- **Scope:** the product models the _decision layer_ of experimentation (what to try, predict, interpret, revise), not physical manipulation or perception.
- **Execution:** every experiment goes through one function, `runExperiment(campaign, params)`. Today it looks the recipe up in a vendored, published dataset (a reductive amination reaction, 768 combinations). A simulator or a real lab backend plugs in there without changing anything upstream.
- **Chat pipeline:** the scientist agent reuses the assistant's chat turn pipeline end to end; see `docs/chat/chat-turns.md`.
- **Study controls:** scrambled feedback and hidden parameter names test whether the agent learns from results or recalls a dataset it saw in training; see `packages/experiment/study/README.md`.
- **Code:** `packages/experiment` owns the domain. The Lab UI lives at `apps/nextjs/src/app/(app)/lab`: a campaign list, and a per-campaign view pairing the chat with a live trajectory chart.

## Tech Stack

| Area                   | Choice                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| Web app                | Next.js App Router (`apps/nextjs`): product app, marketing site, API routes                         |
| Hosting                | Vercel, deployed by GitHub Actions                                                                  |
| Database               | PostgreSQL on Neon                                                                                  |
| ORM                    | Drizzle ORM                                                                                         |
| API                    | tRPC for client components; route handlers for streaming (chat SSE), uploads, and Inngest           |
| Client data fetching   | TanStack Query through tRPC                                                                         |
| AI                     | Vercel AI SDK; every model call goes through the Vercel AI Gateway (`@ai-sdk/gateway`)              |
| Background jobs, crons | Inngest                                                                                             |
| Live streaming         | Redis Streams on Upstash, served to the browser over Server-Sent Events (`docs/chat/chat-turns.md`) |
| Auth                   | Better Auth (email and password, Google)                                                            |
| Email                  | Resend                                                                                              |
| File uploads           | Vercel Blob                                                                                         |
| Rate limiting          | Upstash Redis + `@upstash/ratelimit`                                                                |
| Secrets                | Doppler                                                                                             |
| Repo                   | Turborepo monorepo, pnpm                                                                            |

## Development Workflow

Trunk-based development. `main` is the only long-lived branch. Branch from `main`, keep the branch short-lived, open a pull request into `main`, and merge when checks pass. Urgent fixes follow the same path.

## CI/CD

GitHub Actions runs everything; Vercel's Git integration is disabled.

| Trigger             | Pipeline                                           |
| ------------------- | -------------------------------------------------- |
| Pull request → main | Checks                                             |
| Push to main        | Checks → production migrations → production deploy |

**Checks:** typecheck, lint, format, workspace lint (sherif), tests against the dev database, schema drift (every schema change has a committed migration), and a build with every secret set to `"[SENSITIVE]"`.

**Deploy:** `vercel pull`, `vercel build`, and `vercel deploy --prebuilt`, using the Vercel CLI pinned in the root `package.json`. The build runs in GitHub Actions, where Vercel supplies every sensitive environment variable as the literal string `"[SENSITIVE]"`; real values exist only at runtime. Code must never read a secret at module load: create clients on first use (see `getRedis()` in `@mono/realtime`). The placeholder build in Checks enforces this.

**Renovate** opens dependency PRs against `main` weekly and skips the PR pipeline; the production pipeline checks them before deploy.

## Secrets

- Doppler project `mono` holds the app's secrets, in configs `dev_personal` (local development), `dev` (CI tests), and `prd` (production). `prd` syncs to Vercel's production environment.
- GitHub Actions secrets are set directly in the repo's settings: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `TURBO_TOKEN`, and the Doppler service tokens `DOPPLER_TOKEN_DEV` and `DOPPLER_TOKEN_PRODUCTION`. Update them there when a credential changes.
- Commit no secrets and no `.env` files.

---

# Rules

## Documentation

- App-specific patterns and gotchas live in `AGENTS.md` files colocated with the relevant code. Check for one when working in a new area.
- Docs of important systems live in `docs/`. Update them in the same change as the code they describe, so they always reflect the current codebase.

## Commands (Doppler)

Every command needs Doppler (`doppler run --`) to inject environment variables. `doppler.yaml` points the repo at project `mono`, config `dev_personal`. These docs use the alias `d`:

```bash
alias d='doppler run -- pnpm'
```

Run everything from the repo root: `d dev`, `d build`, `d typecheck`, `d lint`, `d format`, `d test`. Run build and typecheck on the whole monorepo, never filtered to one package.

## Database

| Command         | Description                                 |
| --------------- | ------------------------------------------- |
| `d db:generate` | Generate a migration from schema changes    |
| `d db:migrate`  | Run pending migrations against the database |
| `d db:studio`   | Open Drizzle Studio to browse and edit data |

To change the schema: edit `packages/db/src/*.ts`, run `d db:generate`, review the migration in `packages/db/migrations/`, then run `d db:migrate`.

The Better Auth tables in `packages/db/src/auth-schema.ts` are generated from the auth config. After changing auth plugins or options, run `d auth:generate`, then `d db:generate` for the migration.

### Ad-hoc Queries (psql)

Query the databases directly with `psql` against the Neon `POSTGRES_URL` Doppler injects. Nothing else needs to be running.

```bash
# Dev
doppler run -- sh -c 'psql "$POSTGRES_URL" -c "<SQL>"'

# Production: always read-only
doppler run --config prd -- sh -c 'psql "$POSTGRES_URL" -c "SET default_transaction_read_only = on" -c "<SQL>"'
```

Wrap the `sh -c` argument in single quotes so the outer shell does not expand `$POSTGRES_URL` before Doppler injects it.

Only read. Run `INSERT` / `UPDATE` / `DELETE` / DDL through psql only with explicit user permission, on dev only; schema changes go through `d db:generate` + `d db:migrate`.

## Local Development Startup

```bash
# Terminal 1: app and package watchers
d dev

# Terminal 2: Inngest dev server (auto-discovers /api/inngest)
pnpm inngest:dev
```

The app runs at `http://localhost:3000`. The Inngest dev server runs at `http://localhost:8288`; it needs no keys locally, because the Inngest client derives `isDev` from `NODE_ENV`.

Google sign-in needs the ngrok tunnel, because Google's OAuth redirect URI is registered against it: run `ngrok http 3000` and open `https://multifaced-dazedly-brain.ngrok-free.dev/`. Email sign-in works on localhost.

## Browser Testing

Agents drive a real browser with [agent-browser](https://github.com/vercel-labs/agent-browser) (skill: `.agents/skills/agent-browser/SKILL.md`) or the Claude desktop app's built-in browser.

- Target `http://localhost:3000/`.
- Once testing is complete, stop every dev server, tunnel, and browser session you started.

### Signing in

Sign in with **email and password**:

1. Open `http://localhost:3000/login`.
2. Fill `Email` with `austinweideman@gmail.com`.
3. Fill `Password` with the value of `LOCAL_DEV_PASSWORD` from Doppler (`doppler secrets get LOCAL_DEV_PASSWORD --plain`).
4. Click `Sign in`. You land on `/chat`.

This account exists only in the dev database. Never commit the password.

## Background Jobs (Inngest)

All async and background work runs on Inngest.

- `@mono/jobs` is a leaf package that owns the shared Inngest client and every event contract. Any package can emit any event by depending only on `@mono/jobs`, never on the package that consumes it, so events never create a dependency cycle. The events folder holds only `eventType()` declarations, no functions.
- Feature packages own their functions under `src/jobs/` (or `src/inngest/` for runtime infrastructure like the scheduler).
- The serve handler at `apps/nextjs/src/app/api/inngest/route.ts` imports every feature's functions and registers them.

**Adding a new background job:**

1. Define the event in `packages/jobs/src/events/<domain>/index.ts` using `eventType()` + a Zod schema. For a new domain, add a `./events/<domain>` subpath to `packages/jobs/package.json` exports.
2. Create `packages/<feature>/src/jobs/<verb>.ts` that calls `inngest.createFunction(...)`. One function per file. Each meaningful unit of work goes in its own `step.run("name", ...)` so retries resume from the last successful step.
3. Export the function from `packages/<feature>/src/jobs/index.ts`. Add a `./jobs` subpath to the package's `exports` field.
4. Import the function in the serve handler and add it to the `functions: [...]` array.
5. Send the event from any server-side code with `inngest.send(eventName.create(data, { id }))`.

A job that runs an agent's chat reply replaces step 2 with `createTurnFunction` from `@mono/conversation` and an event in `events/conversation`; see `packages/experiment/src/jobs/runScientistTurn.ts`.

**Conventions:**

- Function `id` is `"<domain>-<verb>"`, kebab-case. Stable forever — changing it breaks in-flight runs.
- Inngest-triggered work uses `systemActor("<domain>")` for its own bookkeeping; work done on a user's behalf (an agent's tools) runs as that user's actor.
- Default `retries: 3`. Default `concurrency: { key: "event.data.userId", limit: 1 }` for user-triggered jobs.
- Assign a `createFunction(...)` result to a local constant, then export it typed as `InngestFunction.Any`; annotating the call directly breaks handler type inference.
- Pass an idempotency `id` on `inngest.send()` whenever a natural dedupe key exists (job row id, etc.) — Inngest dedupes within 24h.
- Handlers contain orchestration only; domain logic lives in the feature's `application/` layer.
- In production, a cron runs as rarely as its purpose allows, to stay within Inngest's monthly execution budget. A cron that needs fast local feedback switches to every minute when `env.NODE_ENV` is `development`.

## Dependencies

**Pin everything.** No `^` or `~` on any dep in any `package.json` or in the `pnpm-workspace.yaml` catalogs. Bumps are explicit edits — don't run `pnpm update`. CLIs used by scripts and CI (Vercel, Inngest, sherif, turbo, shadcn) are pinned dev dependencies run from `node_modules`; never `@latest`, `pnpm dlx`, or global installs. The `engines` field is the one place ranges are allowed.

Enforcement: `.npmrc` sets `strict-peer-dependencies=true`; CI uses `pnpm install --frozen-lockfile`.

## Code Quality

- **Explicit types** - Function return types and interfaces for inputs/outputs
- **No magic strings** - Use enums for type-safe linting
- **No magic numbers** - A numeric value that appears in more than one place MUST be a single named constant referenced everywhere
- **DRY** - Modular, composable code. When something is clearly reusable, extract it to a shared location right away
- **Almost zero comments** - Code is self-documenting. The only exception is something genuinely counterintuitive that the code cannot show; then write one line
- **Use `cn()` for Tailwind** - Not template strings
- **ESM** - `moduleResolution: "Bundler"`; no file extensions in TypeScript imports
- **Production scale** - Bounded queries, paginated lists, idempotent writes, and recovery from crashes, retries, and concurrent clients

---

# Architecture

## Structure

```
apps/
  nextjs/       → Web app, marketing site, API routes, Inngest serve handler
packages/
  agent/        → Agent definitions (model, instructions, tools)
  ai/           → Model registry and MCP client
  api/          → tRPC routers
  attachment/   → File uploads (Vercel Blob)
  auth/         → Better Auth configuration
  billing/      → AI usage cost tracking
  conversation/ → Conversations, messages, durable chat turns
  db/           → Drizzle schema, client, migrations
  email/        → Transactional email (Resend)
  experiment/   → Autolab: environment, scientist agent, campaigns
  jobs/         → Inngest client and event contracts
  realtime/     → Redis client and per-turn event log
  scheduler/    → Scheduled tasks
  ui/           → Shared React components
  user/         → User profiles
  …             → Small shared libraries (core-types, env, errors, time, validators, …)
tooling/        → Shared ESLint, Prettier, Tailwind, TypeScript, CI setup
```

**Dependency rules:** `apps/*` import `packages/*`. Packages import other packages in one direction only: no package imports an app, and no circular dependencies.

---

## Feature Package Structure

Each feature package owns one bounded domain area.

```
packages/<feature>/
  src/
    types/            # Zod schemas + inferred types
    utils/            # Pure functions (optional)
    persistence/      # Drizzle/Postgres access
      *.queries.ts    # SELECT only
      *.mutations.ts  # INSERT/UPDATE/DELETE only
    application/      # Use-cases, auth checks, orchestration
    jobs/             # Inngest functions (optional)
    index.ts          # Public API
```

### types/

- One type per file, named after the type (`ListUserConversationsInput.ts`). The Zod schema and its inferred type live together.
- Schemas are camelCase (`listUserConversationsInputSchema`); types are PascalCase (`ListUserConversationsInput`).
- `types/index.ts` re-exports every type.
- Imports only `zod` and other types in the same folder.
- **Database-backed types** are defined once in `@mono/db` (Drizzle table + `createSelectSchema`/`createInsertSchema` + `$inferSelect`/`$inferInsert`) and re-exported: `export type { Conversation } from "@mono/db"`. Never redefine them.

### utils/

- Pure functions only: calculations, validation, business rules. No DB, no actor, no environment access, no clock reads; a function that needs "now" takes `now: Date` as a parameter.
- Imports types and compute libraries (`@mono/errors`, `@mono/time`). Returns primitives or `types/` types.
- Add the folder only when there is pure logic that is reused or worth testing in isolation.
- A helper that is not specific to this feature (time, string formatting) goes in a shared package such as `@mono/time` or `@mono/validators`.

### persistence/

- Data access only, no business rules. Reads and writes never share a file.
- Every function takes `db: DbOrTx` as its first parameter and returns types from `types/`.
- Write failures throw `InternalServerError` from `@mono/errors`.
- Imports `@mono/db` and types.

### application/

- Every function takes `db: DbOrTx` first and `actor: Actor` second (from `@mono/core-types`).
- All authorization and ownership checks happen here, never in persistence.
- Returns types from `types/`; no tRPC, React, or HTTP primitives.
- Imports utils, persistence, types, and `@mono/errors`.

### Actor Pattern (Authorization)

- `UserActor` is an authenticated user (`{ type: "USER", userId: string }`); `SystemActor` is an internal service (`{ type: "SYSTEM", service: string }`).
- Check the actor type with the guards `isUserActor` and `isSystemActor` before reading its properties.
- Server code creates actors from the session: `userActor(session.user.id)`.

---

## Encapsulation (Critical)

`index.ts` is a package's public API. External code imports from the package root:

- ✅ `import { startConversation } from "@mono/conversation"`
- ❌ `import { insertMessage } from "@mono/conversation/persistence"`

Nothing outside a package imports its persistence layer, so every caller goes through the application layer's authorization checks.

A package exports a subpath only for an entry point that must load separately from its root:

| Subpath                              | Why it is separate                                            |
| ------------------------------------ | ------------------------------------------------------------- |
| `@mono/db/client`, `@mono/db/schema` | The database connection, apart from the schema types          |
| `@mono/<feature>/jobs`               | Inngest functions, imported only by the serve route           |
| `@mono/jobs/events/<domain>`         | Event contracts, importable without any function              |
| `@mono/scheduler/inngest`            | Scheduler runtime functions, imported only by the serve route |

## Integration Points

| Caller                                          | Calls into                                                |
| ----------------------------------------------- | --------------------------------------------------------- |
| Client components                               | tRPC, or a route handler for streaming and uploads        |
| Server components, route handlers, tRPC routers | A package's public application functions, with an `Actor` |
| Inngest functions                               | Application functions                                     |

---

## tRPC Query Invalidation

When invalidating queries with TanStack Query + tRPC v11:

| Method                         | Returns                               | Use Case                                            |
| ------------------------------ | ------------------------------------- | --------------------------------------------------- |
| `trpc.path.queryKey()`         | `[path, { type: "query" }]`           | Only matches regular queries                        |
| `trpc.path.infiniteQueryKey()` | `[path, { type: "infinite", input }]` | Only matches infinite queries                       |
| `trpc.path.pathKey()`          | `[path]`                              | Matches ALL queries under path (regular + infinite) |

**Rule:** Use `pathKey()` to invalidate when you want to clear all cached data for a procedure.

```ts
queryClient.invalidateQueries({
  queryKey: trpc.conversation.list.pathKey(),
});
```

## Route Identity and Component State

Give a stateful client component a `key` tied to the identity it renders, so navigating from one record to another always starts from fresh state:

```tsx
<Chat key={conversation.id} conversationId={conversation.id} />
```

Without the key, React can reuse the component instance across navigations, keeping `useState` values, `useRef` values, and effects from the previous record.

---

# Deferred Decisions

Practices this project deliberately skips for now. Each row says what breaks and when to adopt the practice.

| Practice                                                                  | What breaks without it                                                                                                                                                             | Adopt when                                           |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Error tracking and LLM tracing                                            | Production errors and bad model output leave no trace beyond database rows and Inngest logs                                                                                        | First real users                                     |
| Expand/contract migrations                                                | Migrations run before the deploy; one that drops or renames a column, or adds a required column without a default, breaks the live app until the deploy finishes (about 2 minutes) | First real users                                     |
| A staging or preview environment                                          | Changes are verified only locally before they reach production                                                                                                                     | First real users                                     |
| Branch protection with required checks on `main`                          | A direct push to `main` skips PR review; the production pipeline still blocks a deploy that fails checks                                                                           | A second developer                                   |
| Tests on a fresh database branch per CI run                               | Tests run against the shared dev database, so a test that needs an unapplied migration fails until dev is migrated                                                                 | Tests fail for this reason                           |
| A read-only production database role for agents                           | Production queries stay read-only only through `SET default_transaction_read_only = on`, not a database permission                                                                 | Production holds real user data                      |
| GitHub Actions secrets synced from a separate Doppler project (`mono-ci`) | CI credentials are set by hand in GitHub, so one can go stale unnoticed and break deploys                                                                                          | Another credential goes stale, or a second developer |
