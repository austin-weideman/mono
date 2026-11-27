# Mono

Monorepo for **Autolab**, an autonomous closed-loop research platform: an AI scientist agent that proposes, predicts, runs, and learns from experiments in a chat-driven loop, with a live trajectory chart beside the transcript.

[AGENTS.md](./AGENTS.md) holds the project overview, architecture rules, and conventions. System docs live in [`docs/`](./docs):

- [Chat turns](./docs/chat/chat-turns.md): durable, resumable assistant replies
- [Scheduler](./docs/scheduler/scheduler.md): scheduled and recurring tasks

## Quick Start

Every command needs Doppler for environment variables. Install the [Doppler CLI](https://docs.doppler.com/docs/install-cli), run `doppler login`, then add the alias the docs use:

```bash
alias d='doppler run -- pnpm'
```

### 1. Install dependencies

```bash
pnpm install
```

### 2. Apply database migrations

```bash
d db:migrate
```

### 3. Run the app

```bash
# Terminal 1: app and package watchers
d dev

# Terminal 2: Inngest dev server
pnpm inngest:dev
```

The app runs at `http://localhost:3000` and the Inngest dev server at `http://localhost:8288`. Google sign-in needs the ngrok tunnel described in [AGENTS.md](./AGENTS.md#local-development-startup).

## Common Tasks

| Task                     | Command                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| Change the DB schema     | Edit `packages/db/src/*.ts`, run `d db:generate`, then `d db:migrate` |
| Regenerate auth tables   | `d auth:generate` after changing Better Auth plugins or options       |
| Add a UI component       | `pnpm ui-add` (shadcn/ui CLI)                                         |
| Add a package            | `pnpm turbo gen init`                                                 |
| Add a background job     | See [Background Jobs](./AGENTS.md#background-jobs-inngest)            |
| Check everything locally | `d typecheck`, `d lint`, `d test`, `d build`                          |

## Deployment

Pushes to `main` deploy to production through GitHub Actions: checks, then database migrations, then a Vercel deploy. See [CI/CD](./AGENTS.md#cicd).
