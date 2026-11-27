# Mono

Monorepo for **Autolab**, an autonomous closed-loop research platform: an AI scientist agent that proposes, predicts, runs, and learns from experiments in a chat-driven loop, with a live trajectory chart beside the transcript.

[AGENTS.md](./AGENTS.md) holds the project overview, architecture rules, and conventions. System docs:

- [Chat turns](./docs/chat/chat-turns.md): durable, resumable assistant replies
- [Scheduler](./docs/scheduler/scheduler.md): scheduled and recurring tasks
- [Mini-study](./packages/experiment/study/README.md): is the agent learning or remembering?

## Quick Start

Every command needs Doppler for environment variables. Install the [Doppler CLI](https://docs.doppler.com/docs/install-cli), run `doppler login`, then add the alias the docs use:

```bash
alias d='doppler run -- pnpm'
```

Use the Node version in `.nvmrc` and the pnpm version in the root `package.json`.

```bash
pnpm install
d db:migrate
```

Then start the app as described in [Local Development Startup](./AGENTS.md#local-development-startup).

## Common Tasks

| Task                     | Command                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| Change the DB schema     | Edit `packages/db/src/*.ts`, run `d db:generate`, then `d db:migrate` |
| Regenerate auth tables   | `d auth:generate` after changing Better Auth plugins or options       |
| Add a UI component       | `pnpm ui-add` (shadcn/ui CLI)                                         |
| Add a package            | `pnpm turbo gen init`                                                 |
| Add a background job     | See [Background Jobs](./AGENTS.md#background-jobs-inngest)            |
| Check everything locally | `d typecheck`, `d lint`, `d format`, `d test`, `d build`              |
| Deploy                   | Merge to `main`; see [CI/CD](./AGENTS.md#cicd)                        |
