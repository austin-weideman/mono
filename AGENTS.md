# Introduction

You are an AI coding agent.

## Your Philosophy

You are **maximally truth-seeking**.

- You seek **ground-truth** answers based in code and direct evidence.
- You use your tools to read files and explore the codebase constantly.
- You support claims with direct evidence from the codebase.

You treat this as a serious, multi-engineer, multi-year project where code is professionally architected.

---

# Project Context - BillSentry

BillSentry is an AI-native legislative tracking and analysis platform for California government affairs firms. It ingests every bill in the California legislature, analyzes each one against client-specific position profiles using AI, and proactively surfaces relevant bills, amendments, and procedural events to each customer. The product delivers the _output_ of legislative analysis work — bill summaries, amendment diffs, client-ready memos, hearing briefs — rather than just a tracking interface. This positions it as services-as-software replacing junior-associate labor, not just a productivity tool.

The primary customer is contract lobbying firms in California (~330+ firms) representing multiple clients with distinct policy concerns. The competitive landscape: Capitol Track is the dated legacy incumbent for California; Quorum dominates the broader public affairs market but is built for in-house corporate GA teams, not contract firms, and is priced for enterprise. The wedge is the underserved contract-firm segment where the multi-client, multi-position workflow doesn't fit existing tools. California legislative data is freely available and public domain, published nightly by the state at `downloads.leginfo.legislature.ca.gov` as a complete relational database (`capublic` schema) — no third-party data dependency required.

## Tech Stack

### Frontend

Expo + React Native with React Native Web for shared UI, plus Next.js (App Router) for the marketing site & server components

### Backend

Vercel (web app + API routes + edge/Node functions, Cron); optional Inngest for background workflows

### Database

PostgreSQL (Neon Serverless)

### ORM

Drizzle ORM

### API Strategy

tRPC

### Data Fetching

fetch + TanStack Query on clients; Next.js server actions/route handlers on the server

### AI Layer

Vercel AI SDK + official OpenAI / Anthropic SDKs (streaming)

### Background jobs / queues / scheduling

Inngest (durable workflows, retries, schedules, cron)

### Auth

Better Auth

### Push Notifications

Expo Notifications (APNs/FCM via EAS)

### Secrets

Doppler syncing to Vercel, GitHub Actions, and EAS

### Observability

Sentry (errors), PostHog (product analytics), Langfuse (LLM traces/costs/evals)

### Rate limiting / KV

Upstash Redis + @upstash/ratelimit

### Payments

Stripe Billing or Revenue Cat

### Repo

Monorepo (Turborepo)

### Package Manager

pnpm

### Development

We use strict Gitflow:

Branch Purpose
main Production state only. Deploys come from tested release merges.
dev Active development branch. Most feature work branches off of this.
release/_ Candidate builds deployed to staging for QA/testing. Merged to main when approved.
hotfix/_ Urgent fixes branched from main, tested, and merged back into both main and dev.

Rules:
• Feature development → branch from dev, merge into dev
• Release prep → create release/x.y.z, deploy to staging, test, merge → main
• Hotfixes → branch from main, fix, merge to main, then also merge into dev
• No direct commits to main except hotfix merges

### CI/CD

GitHub Actions orchestrates everything (Vercel auto-deploy disabled).

**Pipeline:** Checks → Migrations → Deploy

**Triggers:**

- PR to dev/main → checks only
- Push to `release/*` → deploy to staging
- Push to `main` → deploy to production

**Secrets:** Doppler (no `.env` files). Syncs to Vercel and GitHub Actions.

## Architecture

A modular monolith in TypeScript with a functional core (pure domain logic), thin object-oriented services at the edges, and feature-based React/RN frontends that only talk to the app via tRPC.

---

# Rules

## Agent Documentation (AGENTS.md)

App-specific patterns and gotchas are documented in `AGENTS.md` files colocated with the relevant code. Check for these when working in a new area.

## Environment Variables (Doppler)

**All commands require Doppler** (`doppler run --`) to inject env vars. Without Doppler: runtime env checks fail, DB connections fail.

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

| Command      | Equivalent To                  | Description                                    |
| ------------ | ------------------------------ | ---------------------------------------------- |
| `d generate` | `doppler run -- pnpm generate` | Generate migration from schema changes         |
| `d migrate`  | `doppler run -- pnpm migrate`  | Run pending migrations against the database    |
| `d push`     | `doppler run -- pnpm push`     | Push schema directly to DB (no migration file) |
| `d studio`   | `doppler run -- pnpm studio`   | Open Drizzle Studio GUI to browse/edit data    |

**Workflow:**

1. Edit schema in `packages/db/src/*.ts`
2. Run `d generate` to create migration file
3. Review migration in `packages/db/migrations/`
4. Run `d migrate` to apply

### Ad-hoc Queries (psql)

Agents can query the dev database directly with `psql` against the Neon `POSTGRES_URL` Doppler injects. No local Postgres, dev server, or Drizzle Studio needs to be running — psql opens its own connection to Neon over the standard wire protocol.

```bash
doppler run -- sh -c 'psql "$POSTGRES_URL" -c "<SQL>"'
```

Quoting matters: wrap the `sh -c` argument in single quotes so the outer shell does not expand `$POSTGRES_URL` before Doppler injects it. Doppler populates `sh`'s env, then `sh` expands the variable for psql.

Useful flags:

- `-x` — expanded display, one column per line (good for wide rows like `message.parts`)
- `-c "\dt"` — list tables; `-c "\d <table>"` — describe a table
- `-f script.sql` — run a multi-statement file

Treat this as read-only. Do not run `INSERT` / `UPDATE` / `DELETE` / DDL through psql against the dev DB without explicit user permission — schema changes go through `d generate` + `d migrate`.

## Local Development Startup

**Local development** requires the Inngest dev server alongside the Next.js dev server:

```bash
# Terminal 1: app
d dev

# Terminal 2: Inngest dev server (auto-discovers /api/inngest)
pnpm inngest:dev

# Terminal 3: Ngrok server
ngrok http 3000
```

The local dev server lives at `https://multifaced-dazedly-brain.ngrok-free.dev/` or `http://localhost:3000/`

The Inngest dev server lives at `http://localhost:8288`. No event/signing keys are needed locally — the Inngest client derives `isDev` from `NODE_ENV` (set to `development` automatically by `next dev`), which skips signature verification and points at the local dev server.

### Agents starting dev servers

Agents must use `pnpm dev:next` (or `doppler run -- pnpm dev:next`), not `d dev`.

## Browser Automation (agent-browser)

Agents drive a real Chrome via [agent-browser](https://github.com/vercel-labs/agent-browser). Full workflow lives in the skill at `.agents/skills/agent-browser/SKILL.md`.

- Always target `https://multifaced-dazedly-brain.ngrok-free.dev/`. Google OAuth's redirect URI is registered against ngrok.
- Send the `ngrok-skip-browser-warning: 1` header on every request to skip the ngrok-free interstitial.
- Once testing is complete, stop every dev server, tunnel, and browser session you started. Don't leave background processes running.

### Signing in

When you need an authenticated session, sign in with **email and password**, not Google.

1. Open `https://multifaced-dazedly-brain.ngrok-free.dev/login` (with the ngrok-skip header).
2. Fill `Email` with `austinweideman@gmail.com`.
3. Fill `Password` with `password`.
4. Click `Sign in`. You land on `/chat`.

The session cookie is scoped to the ngrok domain only — it authorizes BillSentry-as-Austin, nothing else.

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
- Inngest-triggered work uses `systemActor("<domain>")`, not a user actor.
- Default `retries: 3`. Default `concurrency: { key: "event.data.userId", limit: 1 }` for user-triggered jobs.
- Pass an idempotency `id` on `inngest.send()` whenever a natural dedupe key exists (job row id, etc.) — Inngest dedupes within 24h.
- Handlers contain orchestration only; domain logic lives in the feature's `application/` layer.

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

- Design for 1000x scale. The app should be able to support millions of users and be a delightful, bug-free experience.
- Follow industry best practices.
- Never cut corners.

---

# Architecture

## Structure

```
apps/           → Entrypoints (Next.js, Expo)
packages/       → Reusable libraries & feature modules
  db/           → Drizzle client + schema
  api/          → tRPC routers
  ui/           → Shared React/RN components
  conversation/ → Feature package (example)
  lesson/       → Feature package (example)
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
    index.ts          # Public API (ONLY export point)
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
- tRPC routers create actors from session: `userActor(ctx.session.user.id)`

---

## Encapsulation (Critical)

### index.ts is the ONLY public API

External code must import from package root:

- ✅ `import { startConversation } from "@mono/conversation"`
- ❌ `import { insertMessage } from "@mono/conversation/persistence"`

### package.json exports ONLY root

```json
"exports": { ".": { ... } }
```

Never export `"./types"`, `"./utils"`, `"./persistence"`, or `"./application"`.

**Why:** Prevents bypassing auth checks, allows internal refactoring without breaking consumers.

---

## Integration Points

| Layer                         | Calls Into                               |
| ----------------------------- | ---------------------------------------- |
| tRPC routers (`packages/api`) | Application functions                    |
| Frontends (`apps/*`)          | tRPC only (never direct package imports) |

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

## Expo Router (React Navigation)

**Critical behavior:** Navigating to the same route with different params does NOT remount the component—it re-renders with new props.

```
/chat/abc → /chat/xyz   // Same component instance, NOT remounted
```

**Implications:**

- `useRef` values persist across navigations
- `useState` initial values are NOT reset
- `useEffect` with `[]` deps only runs once (on first mount)

**Solution:** Use React's `key` prop to force remount when identity changes:

```tsx
<Chat key={id} conversationId={id} />
```

When `id` changes, React unmounts the old instance and mounts a new one, naturally resetting all hooks.

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
- [ ] `index.ts` is the only public export
- [ ] `package.json` exports only `"."`
