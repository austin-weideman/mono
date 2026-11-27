# Introduction

You are an AI coding agent.

## Your Philosophy

You are **maximally truth-seeking**.

- You seek **ground-truth** answers based in code and direct evidence.
- You use your tools to read files and explore the codebase constantly.
- You support claims with direct evidence from the codebase.

Build everything you build to production standard: robust, observable through its stored state, and consistent with the rules below. When the project deliberately skips a practice, that decision is recorded in [Deferred decisions](#deferred-decisions) with what breaks and when to revisit it. Add a row there for any new shortcut; never take one silently.

---

# Project Context - Autolab

Autolab is an autonomous closed-loop research platform: an AI "scientist" agent that proposes, runs, measures, and learns from experiments in a loop. A campaign is a conversation. The agent finds the best recipe in a small budget of tries by calling one tool, `run_experiment`, in a chat, committing a numeric prediction with every experiment and revising its working theory as results come back. A human can supervise by reading the chat and typing into it, or let the agent run the whole budget autonomously.

The product models the _decision layer_ of closed-loop experimentation (what to try, predict, interpret, revise), not physical manipulation or perception. Execution flows through a single seam, `runExperiment(campaign, params)`, that today looks the recipe up in a vendored, published dataset (a reductive amination reaction, 768 combinations). The same seam is where a simulator or a real lab backend would later plug in without changing anything upstream.

Each campaign is backed by a chat conversation; the scientist agent reuses the assistant's chat turn pipeline (durable Inngest turn, resumable event stream, message persistence, usage/cost tracking) end to end; see `docs/chat/chat-turns.md`. Built-in study controls (scrambled feedback, hidden parameter names) let the platform ask the live research question it ships as a feature: is the agent actually learning from results, or just recalling a dataset it may have seen in training?

The `@mono/experiment` package owns the environment, the scientist agent and its tool, persistence, the application layer, and the Inngest job. It depends on `@mono/agent` and `@mono/conversation` (one-way, never the reverse). The Lab UI lives at `apps/nextjs/src/app/(app)/lab`: a campaign list, and a per-campaign view pairing the chat with a live trajectory chart.

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

Trunk-based development. `main` is the only long-lived branch and is always deployable; every push to `main` deploys to production.

- Branch from `main` for each change and keep branches short-lived.
- Open a pull request into `main`. The PR pipeline runs every check.
- Merge when checks pass. The production pipeline runs the checks again, migrates the production database, and deploys.
- Urgent fixes follow the same path.

## CI/CD

GitHub Actions runs everything; Vercel's Git integration is disabled.

| Trigger             | Pipeline                                           |
| ------------------- | -------------------------------------------------- |
| Pull request → main | Checks                                             |
| Push to main        | Checks → production migrations → production deploy |

**Checks:** typecheck, lint, format, workspace lint (sherif), tests against the dev database, schema drift (every schema change has a committed migration), and a build with every secret set to `"[SENSITIVE]"`.

**Deploy:** `vercel pull`, `vercel build`, and `vercel deploy --prebuilt`, using the Vercel CLI pinned in the root `package.json`. The build runs in GitHub Actions, where Vercel supplies every sensitive environment variable as the literal string `"[SENSITIVE]"`; real values exist only at runtime. Code must never read a secret at module load: create clients on first use (see `getRedis()` in `@mono/realtime`). The placeholder build in Checks enforces this.

**Renovate** opens dependency PRs against `main` weekly and skips the PR pipeline; the production pipeline checks them before deploy.

## Secrets (Doppler)

Doppler is the single source of every secret.

- Doppler project `mono`, configs `dev_personal` (local development), `dev` (CI tests), and `prd` (production). `prd` syncs to Vercel's production environment.
- Doppler project `mono-ci` syncs CI-only credentials to GitHub Actions secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `TURBO_TOKEN`, and the Doppler service tokens `DOPPLER_TOKEN_DEV` and `DOPPLER_TOKEN_PRODUCTION`. These stay out of `mono` so they never reach the app's runtime environment.
- Rotate a secret by changing it in Doppler. Commit no secrets and no `.env` files.

---

# Rules

## Agent Documentation (AGENTS.md)

App-specific patterns and gotchas are documented in `AGENTS.md` files colocated with the relevant code. Check for these when working in a new area.

## Repo-level Documentation

Repo-level docs of important systems or aspects of the product are located in `docs/` under relevant subdirectories. It is critical that these docs remain up to date and do not become stale. They should always be a reflection of the current state of the codebase and product.

## Environment Variables (Doppler)

**All commands require Doppler** (`doppler run --`) to inject env vars. `doppler.yaml` points the repo at project `mono`, config `dev_personal`.

We have an alias: `alias d='doppler run -- pnpm'`

| Command       | Equivalent To                   |
| ------------- | ------------------------------- |
| `d build`     | `doppler run -- pnpm build`     |
| `d test`      | `doppler run -- pnpm test`      |
| `d dev`       | `doppler run -- pnpm dev`       |
| `d typecheck` | `doppler run -- pnpm typecheck` |

**Note:** When running build or typecheck, do NOT filter to one package or app. Run from the repo root on the whole monorepo. It's fast anyway.

## Database Commands

Run from `packages/db` directory. All require Doppler.

| Command      | Equivalent To                  | Description                                 |
| ------------ | ------------------------------ | ------------------------------------------- |
| `d generate` | `doppler run -- pnpm generate` | Generate migration from schema changes      |
| `d migrate`  | `doppler run -- pnpm migrate`  | Run pending migrations against the database |
| `d studio`   | `doppler run -- pnpm studio`   | Open Drizzle Studio GUI to browse/edit data |

**Workflow:**

1. Edit schema in `packages/db/src/*.ts`
2. Run `d generate` to create migration file
3. Review migration in `packages/db/migrations/`
4. Run `d migrate` to apply

The Better Auth tables in `packages/db/src/auth-schema.ts` are generated from the auth config. After changing auth plugins or options, run `doppler run -- pnpm auth:generate`, then `d generate` for the migration.

### Ad-hoc Queries (psql)

Agents can query the databases directly with `psql` against the Neon `POSTGRES_URL` Doppler injects. No local Postgres, dev server, or Drizzle Studio needs to be running.

```bash
# Dev
doppler run -- sh -c 'psql "$POSTGRES_URL" -c "<SQL>"'

# Production: always read-only
doppler run --config prd -- sh -c 'psql "$POSTGRES_URL" -c "SET default_transaction_read_only = on" -c "<SQL>"'
```

Quoting matters: wrap the `sh -c` argument in single quotes so the outer shell does not expand `$POSTGRES_URL` before Doppler injects it.

Useful flags:

- `-x` — expanded display, one column per line (good for wide rows like `message.parts`)
- `-c "\dt"` — list tables; `-c "\d <table>"` — describe a table
- `-f script.sql` — run a multi-statement file

Only read. Run `INSERT` / `UPDATE` / `DELETE` / DDL through psql only with explicit user permission, on dev only; schema changes go through `d generate` + `d migrate`.

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

All async / background work runs on Inngest. Architecture: a leaf `@mono/jobs` package owns the shared Inngest client **and the cross-package event contracts**. Feature packages own their own functions under `src/jobs/` (or `src/inngest/` for runtime infrastructure like the scheduler). The Next.js inngest serve handler at `apps/nextjs/src/app/api/inngest/route.ts` is the single roof — it imports every feature's jobs and registers them with `serve({ client, functions: [...] })`.

**Why events live in `@mono/jobs`, not in the feature package:** events are a shared _contract_ between producer and consumer. Putting them in a leaf package lets any package emit any event by depending only on `@mono/jobs` — never on the consumer feature package. This is the load-bearing fix for the dependency-direction trap: a low-level package (e.g. `scheduler`) can fire an event consumed by a higher-level package (e.g. `conversation`) without forming a cycle. `eventType()` definitions are inert metadata — no `inngest.createFunction(...)` lives in the events folder, only the wire-format declarations — so importing an event never drags in a function-creation side effect.

**Adding a new background job:**

1. Define the event in `packages/jobs/src/events/<domain>/index.ts` using `eventType()` + a Zod schema. Add a `./events/<domain>` subpath to `packages/jobs/package.json` exports.
2. Create `packages/<feature>/src/jobs/<verb>.ts` that calls `inngest.createFunction(...)`. One function per file. Each meaningful unit of work goes in its own `step.run("name", ...)` so retries resume from the last successful step.
3. Export the function from `packages/<feature>/src/jobs/index.ts`. Add a `./jobs` subpath to the package's `exports` field.
4. Import the function in `apps/nextjs/src/app/api/inngest/route.ts` and add it to the `functions: [...]` array passed to `serve(...)`.
5. Send the event from any server-side code with `inngest.send(eventName.create(data, { id }))`.

**Conventions:**

- Function `id` is `"<domain>-<verb>"`, kebab-case. Stable forever — changing it breaks in-flight runs.
- Inngest-triggered work uses `systemActor("<domain>")` for its own bookkeeping; work done on a user's behalf (an agent's tools) runs as that user's actor.
- Default `retries: 3`. Default `concurrency: { key: "event.data.userId", limit: 1 }` for user-triggered jobs.
- Assign a `createFunction(...)` result to a local constant, then export it typed as `InngestFunction.Any`; annotating the call directly breaks handler type inference.
- Pass an idempotency `id` on `inngest.send()` whenever a natural dedupe key exists (job row id, etc.) — Inngest dedupes within 24h.
- Handlers contain orchestration only; domain logic lives in the feature's `application/` layer.
- Crons run every minute in development and as rarely as their purpose allows in production, to stay within Inngest's monthly execution budget.

## Dependencies

**Pin everything.** No `^` or `~` on any dep in any `package.json` or in the `pnpm-workspace.yaml` catalogs. Bumps are explicit edits — don't run `pnpm update`. CLIs used by scripts and CI (Vercel, Inngest, sherif, turbo) are pinned dev dependencies run from `node_modules`; never `@latest`, `pnpm dlx`, or global installs.

Exceptions: `engines` fields and `peerDependencyRules.allowedVersions` (with a `TODO` comment) are allowed to be ranges.

Enforcement: `.npmrc` sets `strict-peer-dependencies=true`; CI uses `pnpm install --frozen-lockfile`.

## Code Quality

- **Explicit types** - Function return types and interfaces for inputs/outputs
- **No magic strings** - Use enums for type-safe linting
- **No magic numbers** - Extract repeated numeric values into named constants. If the same value appears in multiple places, it MUST be a single constant referenced everywhere.
- **DRY** - Modular, composable, reusable code
- **Extract reusable infrastructure immediately** - When something is clearly reusable, extract it to a shared location right away.
- **Use `cn()` for Tailwind** - Not template strings
- **File organization** - Code is split into organized directories according to domain or function.

## Comments

- **NO VERBOSE COMMENTS ALLOWED** - Code should be self-documenting. There should be almost ZERO comments. The only exception is something genuinely counterintuitive that cannot be discerned from the code alone. In these rare cases, a 1-line comment is permitted.

## Module System

- **ESM** with `moduleResolution: "Bundler"`
- **No file extensions** in TypeScript imports (bundler handles this)

## Scale Mindset

Design what you build for production scale: bounded queries, paginated lists, idempotent writes, and recovery from crashes, retries, and concurrent clients.

---

# Architecture

## Structure

```
apps/
  nextjs/       → Web app, marketing site, API routes, Inngest serve handler
packages/
  agent/        → Agent definitions (model, instructions, tools)
  api/          → tRPC routers
  attachment/   → File uploads (Vercel Blob)
  auth/         → Better Auth configuration
  billing/      → AI usage cost tracking
  conversation/ → Conversations, messages, durable chat turns
  db/           → Drizzle schema, client, migrations
  experiment/   → Autolab: environment, scientist agent, campaigns
  jobs/         → Inngest client and event contracts
  realtime/     → Redis client and per-turn event log
  scheduler/    → Scheduled tasks
  ui/           → Shared React components
  …             → Small shared libraries (env, errors, time, validators, …)
tooling/        → Shared ESLint, Prettier, Tailwind, TypeScript, CI setup
```

**Dependency rules:**

- `apps/*` → `packages/*` ✅
- `packages/*` → other `packages/*` (inward only) ✅
- `packages/*` → `apps/*` ❌
- Circular dependencies ❌

---

## Feature Package Structure

Each feature package owns one bounded domain area.

```
packages/<feature>/
  src/
    types/            # One file per type (Zod schemas + inferred types)
      Conversation.ts
      ListUserConversationsInput.ts
      index.ts        # Internal barrel for types
    utils/            # Pure functions: calculations, validation, business rules.
                      # No I/O, no DB, no actor. Optional — only when present.
    persistence/      # Drizzle/Postgres access (CQRS)
      *.queries.ts    # SELECT operations only
      *.mutations.ts  # INSERT/UPDATE/DELETE only
    application/      # Use-cases, auth checks, orchestration
    jobs/             # Inngest functions (optional)
    index.ts          # Public API
```

### Types Folder Rules

- **One type per file** - File name matches the type name (PascalCase)
- **Zod schemas + inferred types live together** - Single source of truth
- **Schemas use camelCase** - `listUserConversationsInputSchema` (runtime values)
- **Types use PascalCase** - `ListUserConversationsInput` (type definitions)
- **Internal barrel allowed** - `types/index.ts` re-exports all types

### Database-Backed Types

- **Define in `@mono/db`** - Drizzle table + `createSelectSchema`/`createInsertSchema` + `$inferSelect`/`$inferInsert`
- **Re-export in feature packages** - `export type { Conversation } from "@mono/db"` (don't redefine)
- **Why:** Guarantees DB-to-application type sync with zero duplication

### Layer Rules

| Layer            | Contains                                                                                                                     | Imports Allowed                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **types/**       | Zod schemas, inferred types, pure interfaces                                                                                 | `zod`, other types in same folder                       |
| **utils/**       | Pure functions: calculations, validation, business rules. No I/O, no DB, no actor, no clock reads — `now: Date` is injected. | types, `@mono/errors`, `@mono/time`, other compute libs |
| **persistence/** | DB queries/mutations                                                                                                         | `@mono/db`, types                                       |
| **application/** | Use-cases, auth, orchestration                                                                                               | utils, persistence, types, `@mono/errors`               |

### Utils Rules

- **Pure functions only** - No DB access, no actor, no `Date` reads, no environment access. Reach for this layer when logic is reusable across application functions or when calculation is non-trivial enough to test in isolation.
- **Inject the clock** - functions that need "now" accept `now: Date` as a parameter so tests can advance time deterministically
- **Return primitive types or `types/` types** - never tRPC/HTTP/React primitives
- **Optional layer** - small features may not need a `utils/` folder. Only add it when there's actual pure logic to extract
- **Generic helpers belong in shared packages** - if a util isn't scoped to this feature (e.g. time/date helpers, string formatting), put it in `@mono/time`, `@mono/validators`, etc., not here

### CQRS (Command Query Responsibility Segregation)

- **Separate reads from writes** - Never mix in same file
- Queries can use read replicas, mutations hit primary
- Easier testing, better performance at scale

### Persistence Rules

- Accept `db: DbOrTx` as first parameter (dependency injection)
- Return types from `types/` folder
- No business rules - just data access
- Use `InternalServerError` from `@mono/errors` for write failures

### Application Rules

- Accept `db: DbOrTx` as first parameter
- Accept `actor: Actor` as second parameter (from `@mono/core-types`)
- Handle all auth/ownership checks here
- Return types from `types/` folder (no tRPC, React, HTTP primitives)

### Actor Pattern (Authorization)

- Every application function receives an `Actor` identifying who is performing the action
- `UserActor` - authenticated user (`{ type: "USER", userId: string }`)
- `SystemActor` - internal service (`{ type: "SYSTEM", service: string }`)
- Use type guards (`isUserActor`, `isSystemActor`) to check actor type before accessing properties
- Authorization checks happen in application layer, never in persistence layer
- Server code creates actors from the session: `userActor(session.user.id)`

---

## Encapsulation (Critical)

### index.ts is the public API

External code imports from the package root:

- ✅ `import { startConversation } from "@mono/conversation"`
- ❌ `import { insertMessage } from "@mono/conversation/persistence"`

### Subpath exports are separate entry points

A package exports a subpath only for an entry point that must load separately from its root:

| Subpath                              | Why it is separate                                            |
| ------------------------------------ | ------------------------------------------------------------- |
| `@mono/db/client`, `@mono/db/schema` | The database connection, apart from the schema types          |
| `@mono/<feature>/jobs`               | Inngest functions, imported only by the serve route           |
| `@mono/jobs/events/<domain>`         | Event contracts, importable without any function              |
| `@mono/scheduler/inngest`            | Scheduler runtime functions, imported only by the serve route |

Export `types`, `utils`, `persistence`, and `application` only through `index.ts`, so every caller goes through the application layer's authorization checks.

---

## Integration Points

| Caller                                          | Calls into                                                |
| ----------------------------------------------- | --------------------------------------------------------- |
| Client components                               | tRPC, or a route handler for streaming and uploads        |
| Server components, route handlers, tRPC routers | A package's public application functions, with an `Actor` |
| Inngest functions                               | Application functions                                     |

Nothing outside a package imports its persistence layer.

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

**Reference:** Query key generation logic is in:
`apps/nextjs/node_modules/@trpc/tanstack-react-query/src/internals/createOptionsProxy.ts`

---

## Route Identity and Component State

Give a stateful client component a `key` tied to the identity it renders, so navigating from one record to another always starts from fresh state:

```tsx
<Chat key={conversation.id} conversationId={conversation.id} />
```

Without the key, React can reuse the component instance across navigations, keeping `useState` values, `useRef` values, and effects from the previous record.

---

## Checklist

Before any feature package is complete:

- [ ] Types folder uses one file per type (no monolithic types.ts)
- [ ] Zod schemas and inferred types live in the same file
- [ ] Pure logic lives in `utils/`, not `application/` (when present)
- [ ] Utils functions are pure: no DB, no actor, no clock reads (`now: Date` is injected)
- [ ] Generic time/string/etc. helpers live in shared packages (`@mono/time`, `@mono/validators`), not in a feature's `utils/`
- [ ] Persistence uses CQRS (`*.queries.ts` / `*.mutations.ts`)
- [ ] Functions accept `db: DbOrTx` as first param
- [ ] Application functions accept `actor: Actor` as second param
- [ ] Mutations use `InternalServerError`, not generic `Error`
- [ ] Application layer handles all auth/ownership via Actor checks
- [ ] `index.ts` is the public API; subpath exports are only separate entry points

---

# Deferred Decisions

Practices this project deliberately skips for now. Each row says what breaks and when to adopt the practice.

| Practice                                         | What breaks without it                                                                                                                                                             | Adopt when                      |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Error tracking and LLM tracing                   | Production errors and bad model output leave no trace beyond database rows and Inngest logs                                                                                        | First real users                |
| Expand/contract migrations                       | Migrations run before the deploy; one that drops or renames a column, or adds a required column without a default, breaks the live app until the deploy finishes (about 2 minutes) | First real users                |
| A staging or preview environment                 | Changes are verified only locally before they reach production                                                                                                                     | First real users                |
| Branch protection with required checks on `main` | A direct push to `main` skips PR review; the production pipeline still blocks a deploy that fails checks                                                                           | A second developer              |
| Tests on a fresh database branch per CI run      | Tests run against the shared dev database, so a test that needs an unapplied migration fails until dev is migrated                                                                 | Tests fail for this reason      |
| A read-only production database role for agents  | Production queries stay read-only only through `SET default_transaction_read_only = on`, not a database permission                                                                 | Production holds real user data |
