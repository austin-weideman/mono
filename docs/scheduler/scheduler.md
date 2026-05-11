# Scheduler

A generic, timezone-correct system for kicking off arbitrary tasks at any timestamp on any recurrence rule (RFC 5545 `RRULE`).

The scheduler is **start-time-oriented**: a task is "scheduled to start at 9am", not "scheduled to deliver at 9am". Handlers may take seconds to minutes (LLM/agentic workflows have unpredictable duration), so completion time is intentionally not part of the contract.

---

## TL;DR

- **Postgres** owns the schedule definition (queryable, mutable, auditable).
- **Inngest** owns durable execution: retries, DLQ, observability, concurrency. All retry/attempt state lives in Inngest — we store only `inngestEventId` for correlation.
- **`rrule`** (RFC 5545) + **`luxon`** handle recurrence math and DST.
- A thin dispatcher tick (one Inngest cron function with two checkpointed steps) ties the three together.

Code: [`packages/scheduler/`](../../packages/scheduler/), schema: [`packages/db/src/scheduled-task.ts`](../../packages/db/src/scheduled-task.ts), event contract: [`packages/jobs/src/events/scheduler/index.ts`](../../packages/jobs/src/events/scheduler/index.ts).

---

## High-level architecture

```
 ┌─────────────────────────────┐
 │ Caller (tRPC / system code) │
 └──────────────┬──────────────┘
                │ createScheduledTask({ rrule, tz, taskType, payload, ... })
                ▼
       ┌────────────────────┐
       │  scheduled_task    │ ◄── write-time rrule validation (probe computeNextRun)
       │  (Postgres row)    │     dtstart, timezone, rrule, payload, next_run_at
       └────────┬───────────┘
                │
                │ scheduler-dispatcher cron tick (Inngest function)
                │
        ┌───────┴─────────┐
        │ step.run        │   dispatchDue(db, now)
        │ "dispatch"      │   - SELECT … WHERE next_run_at <= now FOR UPDATE SKIP LOCKED
        │ (Postgres txn)  │   - per row: upsert scheduled_task_run (pending)
        │                 │              advance next_run_at via computeNextRun
        │                 │              flip to 'completed' if rrule exhausted
        │                 │              per-row try/catch → 'failed' on rrule throw
        └───────┬─────────┘
                │ commits before emit step runs
                ▼
        ┌─────────────────┐   emitPendingRuns(db, inngest, now)
        │ step.run        │   - SELECT … WHERE status='pending' AND inngest_event_id IS NULL
        │ "emit"          │   - per row: inngest.send(scheduled_task/due, id=`${taskId}:${iso}`)
        │ (outside txn)   │              UPDATE inngest_event_id on success
        └───────┬─────────┘   - failed send → row stays pending → next tick retries
                │ event fanout
                ▼
       ┌────────────────────┐  scheduler-executor (event: scheduled_task/due)
       │ scheduler-executor │  step.run("load")    → loadAndStartRun → status='running'
       │ (Inngest function) │  step.run("handle")  → handler.execute(ctx, parsed payload)
       │                    │  step.run("complete")→ status='succeeded'
       │                    │  onFailure (after retries exhausted) → status='failed'
       └────────┬───────────┘
                │
                ▼
       ┌────────────────────┐
       │ feature handler    │  e.g. scheduled-chat → inngest.send(conversation/scheduled.start)
       │ (registry lookup)  │
       └────────────────────┘
```

The "dispatch then emit in separate `step.run` calls" structure implements the **transactional outbox pattern**: the DB write commits before any external send, so a crash or network blip can't fork the two writes. The pending row _is_ the outbox; no separate polling cron is needed.

---

## Package layout

```
packages/scheduler/src/
  types/                  one file per type — Zod schemas + inferred types
  utils/
    computeNextRun.ts     pure: (rrule, tz, dtstart, after) → Date | null
  persistence/            CQRS split (queries.ts / mutations.ts), db is dep-injected
  application/            use-cases, auth checks, orchestration
    createScheduledTask.ts
    updateScheduledTask.ts
    pauseScheduledTask.ts / resumeScheduledTask.ts
    deleteScheduledTask.ts
    getScheduledTask.ts / loadScheduledTasks.ts / listScheduledTaskRuns.ts
    dispatchDue.ts        called from inngest/dispatcher.ts
    emitPendingRuns.ts    called from inngest/dispatcher.ts
    loadAndStartRun.ts    called from inngest/executor.ts
    completeRun.ts        completeRun / failRun, called from inngest/executor.ts
  handlers/
    registry.ts           taskType → TaskHandler lookup
    scheduled-chat.handler.ts
  inngest/
    dispatcher.ts         cron function (one tick)
    executor.ts           event handler for scheduled_task/due
  test-setup.ts           global vitest mock of @mono/jobs (leak guard)
  index.ts                ONLY public API entry
```

Follows the standard feature-package rules in [AGENTS.md](../../AGENTS.md): `index.ts` is the only public export, `package.json` exports only `"."` (plus `./inngest` for serve-handler registration), persistence is private.

The Inngest functions are registered in [`apps/nextjs/src/app/api/inngest/route.ts`](../../apps/nextjs/src/app/api/inngest/route.ts) via the `@mono/scheduler/inngest` subpath.

---

## Data model

### `scheduled_task` — the definition

| Column                                 | Notes                                                                 |
| -------------------------------------- | --------------------------------------------------------------------- |
| `id`                                   | uuid pk                                                               |
| `userId`                               | fk → user.id, nullable (SYSTEM tasks have no user)                    |
| `actorType`                            | `USER` \| `SYSTEM`                                                    |
| `taskType`                             | text — registry key (`scheduled_chat`, …)                             |
| `payload`                              | `jsonb` — polymorphic, validated per `taskType` via Zod registry      |
| `rrule`                                | RFC 5545 string, e.g. `FREQ=DAILY;BYHOUR=9`                           |
| `dtstart`                              | timestamptz — first-occurrence anchor (UTC)                           |
| `timezone`                             | IANA string — **fixed at creation**; see Timezone Policy              |
| `status`                               | `active` \| `paused` \| `completed` \| `failed`                       |
| `nextRunAt`                            | **the hot column** — recomputed via `computeNextRun` after every fire |
| `lastRunId`                            | uuid (no FK) — O(1) latest-run pointer (Nango trick)                  |
| `createdAt`, `updatedAt`, `archivedAt` | audit                                                                 |

Indexes:

- `idx_scheduled_task_due` — partial: `(next_run_at) WHERE status='active'` → dispatch is O(log n) on active rows, not total rows.
- `idx_scheduled_task_user` — `(user_id, created_at desc)` → user-scoped listing.

### `scheduled_task_run` — execution history

| Column            | Notes                                                             |
| ----------------- | ----------------------------------------------------------------- |
| `id`              | uuid pk                                                           |
| `scheduledTaskId` | fk → scheduled_task.id, **cascade delete**                        |
| `scheduledFor`    | the intended wall instant; also drives FIFO emit ordering         |
| `completedAt`     | nullable                                                          |
| `status`          | `pending` \| `running` \| `succeeded` \| `failed`                 |
| `error`           | jsonb snapshot of last error (full history lives in Inngest)      |
| `inngestEventId`  | correlation key — click through to Inngest UI for attempt history |

Indexes / constraints:

- `uniq_scheduled_task_run_task_for` — `UNIQUE(scheduledTaskId, scheduledFor)` — DB-level idempotency.
- `idx_scheduled_task_run_emit_pending` — partial: `(scheduled_for) WHERE status='pending' AND inngest_event_id IS NULL` → emit query is O(log n) on the outbox.

### FK asymmetry

The FK direction is intentionally one-way:

- `scheduled_task_run.scheduled_task_id → scheduled_task.id` is **enforced** (cascade delete) so runs always have a valid parent.
- `scheduled_task.last_run_id` is a **plain uuid** (no FK) to dodge the chicken-and-egg insert order: you can't insert the task pointing at a run that doesn't exist yet.

### Why `jsonb` for `payload`

A genuinely generic task system needs polymorphic payloads. The alternative (one table per `taskType`) fights the generic goal. **Type safety lives in the handler registry**: each handler declares a `payloadSchema: z.ZodType<TPayload>`, and `createScheduledTask` / the executor validate against it. This is a deliberate carve-out from AGENTS.md's "no JSON in DB" rule.

---

## Recurrence and DST

The recurrence math runs in **pure floating-UTC mode**, and the wall-clock ↔ absolute-UTC conversion happens at the boundaries via luxon. We do **not** use rrule.js's `tzid` option.

See [`packages/scheduler/src/utils/computeNextRun.ts`](../../packages/scheduler/src/utils/computeNextRun.ts).

### Why no `tzid`

rrule.js's `tzid` leaks the system's local timezone into `BYHOUR` resolution. Empirically: the same rule string produces different UTC outputs depending on Node's `TZ` env var. That's a portability/correctness bomb in a multi-environment system (local dev, CI, prod, Vercel edge…).

Instead:

1. Convert `dtstart` and `after` to **floating Dates** (UTC fields = wall-clock fields in the schedule's IANA tz) via `toFloatingDate`.
2. Let rrule do purely calendrical math (`BYDAY`, `BYHOUR`, `INTERVAL`, `BYMONTHDAY` etc.) on those floating dates.
3. Convert the resulting floating Date back to an absolute UTC instant via `fromFloatingDate(result, timezone)`.

This makes "9am daily in America/Los_Angeles" remain 9am local across DST — each occurrence is resolved through luxon's IANA database at the boundary, so the absolute UTC instant shifts by an hour when the offset shifts.

The conversion helpers (`toFloatingDate`, `fromFloatingDate`, `isValidTimezone`) live in [`@mono/time`](../../packages/time/) because they're not scheduler-specific.

### What we don't materialize

We **never** materialize a UTC series up front. `nextRunAt` is recomputed after every fire from `(rrule, timezone, dtstart, after = now)`. This is what keeps DST correct without bookkeeping.

---

## Execution flow

### Dispatcher tick

[`packages/scheduler/src/inngest/dispatcher.ts`](../../packages/scheduler/src/inngest/dispatcher.ts) is the only cron entry point. One function, two checkpointed steps:

1. **`step.run("dispatch")`** → [`dispatchDue(db, now)`](../../packages/scheduler/src/application/dispatchDue.ts):
   - Opens a Postgres transaction.
   - `findDueScheduledTasks`: `SELECT … WHERE status='active' AND next_run_at <= $1 ORDER BY next_run_at FOR UPDATE SKIP LOCKED LIMIT 1000`.
   - For each row, in a per-row try/catch:
     - `upsertPendingScheduledTaskRun` (uses `ON CONFLICT DO UPDATE` as no-op so `RETURNING` populates even on the unique-constraint replay path — see below).
     - `updateScheduledTaskById`: advance `nextRunAt`, set `lastRunId`, flip to `completed` if rrule exhausted.
     - On rrule throw: mark the schedule `failed`, continue batch.
   - Commits.

2. **`step.run("emit")`** → [`emitPendingRuns(db, inngest, now)`](../../packages/scheduler/src/application/emitPendingRuns.ts):
   - Runs **after** the dispatch txn commits. `inngest.send()` inside a DB transaction would re-introduce the dual-write bug the outbox pattern exists to prevent.
   - `findPendingEmitRuns`: `SELECT … WHERE status='pending' AND inngest_event_id IS NULL FOR UPDATE SKIP LOCKED LIMIT 1000`.
   - For each row: compose event id `${scheduledTaskId}:${scheduledFor.toISOString()}`, `inngest.send(scheduledTaskDueEvent.create(data, { id }))`, then `UPDATE inngest_event_id`.
   - A failed send leaves the row pending; the next tick re-attempts it.

**Cron cadence:** `* * * * *` in development for fast feedback; `0 * * * *` in production to stay under Inngest Hobby's 50k monthly executions. See `DISPATCHER_CRON` in `dispatcher.ts`. Cadence is purely a cost knob — increase it when we move off Hobby.

### Executor

[`packages/scheduler/src/inngest/executor.ts`](../../packages/scheduler/src/inngest/executor.ts) triggers on `scheduled_task/due`. Three checkpointed steps + an `onFailure` hook:

1. **`step.run("load")`** → [`loadAndStartRun(db, runId)`](../../packages/scheduler/src/application/loadAndStartRun.ts): fetches run + parent schedule, builds `userActor(task.userId)` or `systemActor('scheduler')`, flips run to `running`. Returns serializable `{ task, actor, taskType, payload, scheduledForIso }` so the next steps survive JSON checkpointing.
2. **`step.run("handle")`**: looks up the handler via `getTaskHandler(taskType)`, parses `payload` through `handler.payloadSchema`, calls `handler.execute(ctx, parsed)`. Throws `InternalServerError` if no handler is registered.
3. **`step.run("complete")`** → `completeRun(db, { runId, now })`: status `succeeded`, sets `completedAt`, clears `error`.
4. **`onFailure`** (runs after Inngest exhausts retries) → `failRun(db, { runId, now, error })`: status `failed`, captures last error.

`retries: 3` on both functions. All retry/attempt state lives in Inngest, accessible via `inngestEventId` from the run row.

---

## Idempotency

Belt and braces, on purpose:

- **Inngest layer:** the event id is composed deterministically as `${scheduledTaskId}:${scheduledFor.toISOString()}`. Inngest dedupes identical event ids within a 24h window.
- **DB layer:** `UNIQUE(scheduledTaskId, scheduledFor)` on `scheduled_task_run`. A replayed dispatch can't create a second run row for the same instant.

The replay-safe upsert is worth a closer look — [`upsertPendingScheduledTaskRun`](../../packages/scheduler/src/persistence/scheduled-task-run.mutations.ts) uses `ON CONFLICT DO UPDATE` (with a no-op set) instead of `ON CONFLICT DO NOTHING`. The reason is `RETURNING`: `DO NOTHING` returns no row on the conflict path, but the dispatcher needs the existing row's id to populate `lastRunId`. A no-op `DO UPDATE` produces a row in both cases.

---

## Handler registry

```ts
// packages/scheduler/src/types/TaskHandler.ts
export interface TaskHandler<TPayload> {
  taskType: TaskType;
  payloadSchema: z.ZodType<TPayload>;
  execute(ctx: HandlerContext, payload: TPayload): Promise<void>;
}

export interface HandlerContext {
  db: DbOrTx;
  actor: Actor;
  runId: string;
  scheduledFor: Date;
}
```

[`packages/scheduler/src/handlers/registry.ts`](../../packages/scheduler/src/handlers/registry.ts) holds a static `Record<TaskType, TaskHandler<any>>`. The `any` is intentional — `TaskHandler<TPayload>` is invariant in its payload type, so a wider supertype isn't expressible. Per-handler Zod schemas restore type safety at the boundary.

**Adding a new task type:**

1. Add the literal to `TaskType` in [`types/TaskType.ts`](../../packages/scheduler/src/types/TaskType.ts).
2. Write a `TaskHandler<TPayload>` with a Zod `payloadSchema`.
3. Register it in [`handlers/registry.ts`](../../packages/scheduler/src/handlers/registry.ts).
4. Zero changes to dispatcher / executor / persistence.

**Reference handler:** [`scheduled-chat.handler.ts`](../../packages/scheduler/src/handlers/scheduled-chat.handler.ts) emits `conversation/scheduled.start`. Note that the handler delegates real work to _another_ Inngest function — this keeps the executor step short and lets the conversation feature own its own retry policy.

**Feature-local handlers** are encouraged: a `daily-reminder.handler.ts` can live in `packages/lesson/` rather than `packages/scheduler/handlers/` as the system grows. The registry just needs the import. Today everything is in `packages/scheduler/` because there's only one handler.

---

## Cross-package events

The Inngest client and cross-package event contracts both live in [`@mono/jobs`](../../packages/jobs/), the leaf package. The scheduler imports `inngest` from there rather than constructing its own client.

The dispatcher emits [`scheduledTaskDueEvent`](../../packages/jobs/src/events/scheduler/index.ts):

```ts
eventType("scheduled_task/due", {
  schema: z.object({
    runId: z.uuid(),
    scheduledTaskId: z.uuid(),
    scheduledFor: z.string(), // ISO — Date doesn't survive Inngest JSON serialization
  }),
});
```

Events live in `@mono/jobs` (not the producing or consuming feature package) to **break dependency cycles**: a low-level package like `scheduler` can fire an event consumed by a higher-level package like `conversation` without forming a cycle, because both depend only on the leaf `jobs` package. `eventType()` is inert metadata (no `createFunction(...)` side effect), so importing an event never drags in a function registration.

---

## Actor model

Every application function takes an `Actor` (`@mono/core-types`). The scheduler enforces:

- `createScheduledTask`: `USER` actors can only create their own `USER` tasks. Mismatch between `actorType` and presence of `userId` → `BadRequestError`.
- `updateScheduledTask` / `pauseScheduledTask` / `resumeScheduledTask` / `deleteScheduledTask` / `getScheduledTask`: `UserActor` can only touch its own schedules → otherwise `ForbiddenError`.
- `loadAndStartRun` constructs the execution-time actor from the persisted `actorType`: `userActor(task.userId)` for USER, `systemActor("scheduler")` for SYSTEM. Handlers receive this in `ctx.actor`.

Handlers can themselves enforce actor constraints — e.g. `scheduled-chat` rejects SYSTEM actors with `ForbiddenError`.

---

## Timezone policy (fixed/anchored)

Schedules use a **fixed timezone model**:

- Every schedule stores its own `timezone` as a concrete IANA identifier.
- Snapshotted at creation. Never changes implicitly — not on user travel, not on `user_profile.timezone` updates.
- The only way to change a schedule's tz is an **explicit user edit** via `updateScheduledTask`, which recomputes `nextRunAt`.

**Example:** a user in California creates "Every Monday at 9am Pacific Time" then flies to New York. The schedule continues to fire at 9am Pacific (12pm Eastern). It only shifts if they explicitly edit the schedule.

**Implications:**

- No cascade logic from `user_profile.timezone`.
- `timezone` is never `null` or a sentinel like `'USER_PROFILE'`. Always a real IANA string. `createScheduledTask` takes it as a required argument.
- Frontend should pre-fill the timezone picker from the user's profile, then _lock it into the row_. Schedule list/detail views should show the schedule's tz explicitly (especially when it differs from the user's current local tz).

A future `timezoneMode: 'fixed' | 'follow_profile'` column is forward-compatible if "follow my tz" demand emerges. Not at MVP.

---

## Update semantics

When `updateScheduledTask` changes any of `rrule`, `timezone`, or `dtstart`:

- Recompute `nextRunAt = max(now, computeNextRun(newRule, newTz, newDtstart, now))`.
- **Never** backfill missed occurrences from the old schedule. An update is a new schedule.

Pause/resume:

- Pause freezes `nextRunAt` and sets `status='paused'`.
- Resume requires `status='paused'` (else `BadRequestError`) and applies `nextRunAt = max(now, existing.nextRunAt)` — so a long-paused schedule doesn't fire-storm the moment it resumes.

Delete is soft (`archivedAt`); run history is preserved. All read queries filter `archivedAt IS NULL`.

---

## Downtime semantics

**Best-effort.** If the dispatcher is down when a fire-time passes, that occurrence is lost — we do not catch up.

Mechanically this falls out of `computeNextRun(rrule, tz, now())`: when the dispatcher resumes, any row with `next_run_at < now` fires _once_ (with `scheduledFor = old next_run_at`), then `nextRunAt` jumps forward to the next occurrence strictly after `now`, skipping all intermediate missed ones.

No catch-up knobs, no staleness thresholds, no per-schedule policy. Handlers that need stricter semantics (billing, etc.) handle catch-up internally.

---

## Failure recovery

Delegated to Inngest. Each `step.run` is checkpointed; on crash Inngest replays completed steps from cache and re-executes only the failed one. After the executor's `retries: 3` budget is exhausted, `onFailure` marks the run `failed`.

We do **not**:

- Maintain a row-level lease or sweeper.
- Denormalize attempt counts. (That builds a parallel, weaker retry system on top of the strong one Inngest provides.)

To investigate a specific run's retry history, look it up in the Inngest UI via the run's `inngestEventId`.

The one residual failure mode Inngest does not cover: the `emit` step succeeds, Inngest acks the `send`, but the event is dropped before any executor picks it up. This is vanishingly rare; treat it as a **monitoring** concern (alert on `running` rows older than 24h, or `pending` rows with `inngest_event_id IS NOT NULL` older than 1h). No auto-mutation.

---

## Schedule compute errors

`rrule.after()` is pure: same inputs → same outputs (or same throw). Two distinct terminal cases:

- **Exhausted** (`computeNextRun` returns `null`): set `status='completed'`. Expected for bounded rules (`COUNT`, `UNTIL`).
- **Thrown** (malformed rule, tz anomaly): re-running with the same inputs will throw again. Mark the schedule `status='failed'` immediately. No retry counter; nothing transient to wait out.

**Defense in depth:**

- **Primary — write-time validation:** `createScheduledTask` and `updateScheduledTask` parse the rrule and run a `computeNextRun` probe. Bad rules surface as `BadRequestError` and never hit the table. Rules that produce zero occurrences from `dtstart` (e.g. `UNTIL` already past) are also rejected.
- **Defense — dispatch-time per-row try/catch:** wraps each row's `computeNextRun`. One bad row marks itself `failed` without poisoning the batch. Should rarely fire if write-time validation is correct (covers exotic cases: library upgrade behavior change, IANA tzdata anomaly).

---

## Scalability and concurrency

| Property                         | How it's achieved                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| O(log n) dispatch on active rows | Partial index `(next_run_at) WHERE status='active'`                                           |
| O(log n) emit on the outbox      | Partial index `(scheduled_for) WHERE status='pending' AND inngest_event_id IS NULL`           |
| Multi-dispatcher safety          | `FOR UPDATE SKIP LOCKED` — any number of dispatcher instances coexist with zero coordination  |
| No dual-write bugs               | DB txn (dispatch) commits before `inngest.send()` (emit) runs. The pending row is the outbox. |
| Crash-safe execution             | Inngest checkpointed steps + retries                                                          |
| Bad-schedule containment         | Per-row try/catch in dispatcher; write-time validation up front                               |

Batch limits are `LIMIT 1000` on both the dispatch and emit queries (`DISPATCH_BATCH_LIMIT`, `EMIT_BATCH_LIMIT` in the persistence layer). At the dev `* * * * *` cadence this comfortably handles tens of thousands of active schedules; the prod `0 * * * *` cadence and a Hobby plan handle hundreds of thousands. Beyond ~1M active schedules, revisit batch size and dispatcher cadence.

---

## Observability

- **Inngest UI** is the primary source for execution history, retry attempts, and replay. Get there via the run's `inngestEventId`.
- `dispatchDue` returns `{ considered, dispatched, completed, failed }`; `emitPendingRuns` returns `{ considered, emitted, failed }`. These show up as the dispatcher function's return value in the Inngest UI tick-by-tick.
- Recommended monitoring (not yet wired): alert on `running` rows where `scheduledFor > 24h ago` (handler hung or event dropped post-ack), and `pending` rows with `inngest_event_id IS NOT NULL` where `scheduledFor > 1h ago` (extremely rare event-drop scenario).

---

## Public API

Today the only public API is the `@mono/scheduler` package exports — [`src/index.ts`](../../packages/scheduler/src/index.ts):

- `createScheduledTask`, `updateScheduledTask`, `pauseScheduledTask`, `resumeScheduledTask`, `deleteScheduledTask`
- `getScheduledTask`, `loadScheduledTasks`, `listScheduledTaskRuns`
- `computeNextRun` (pure)
- `getTaskHandler`, `taskHandlers`, `scheduledChatHandler`, `scheduledChatPayloadSchema`
- All types from `./types`

The tRPC router (`scheduler.create`, `scheduler.list`, `scheduler.get`, `scheduler.update`, `scheduler.pause`, `scheduler.resume`, `scheduler.delete`, `scheduler.listRuns`) is **not yet implemented** — see Step 5 of the plan. Frontend code should not import from `@mono/scheduler` directly; wait for the tRPC surface.

---

## Testing approach

One disciplined choice makes the rest easy: **inject the clock.** No application or persistence code calls `new Date()` or Postgres `now()` directly. Only the Inngest cron entry points read the wall clock; they pass the resulting `Date` down. Tests pass a fixed `Date` and turn "wait for the next tick" into "advance the clock at memory speed".

| Layer                 | Strategy                                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `computeNextRun`      | Pure-function unit tests, ~20 cases. DST spring-forward + fall-back, `BYMONTHDAY=-1`, exhaustion via `UNTIL`, inclusive flag, plus a "walk N occurrences" proof suite for common patterns. |
| Application functions | Real dev Postgres via `withTestTransaction` from `@mono/testing` (transaction-per-test, rolled back). Auth, validation, recompute-on-update, no-fire-storm-on-resume, pagination.          |
| Dispatcher            | Real Postgres. Test `dispatchDue` directly: happy path, future-skip, paused/completed/failed skip, exhaustion → completed, malformed-rrule containment, idempotent replay.                 |
| Emit                  | Fake `inngest.send` (we own the contract). Asserts event-id composition, that `inngestEventId` is set only on success, and that failed sends leave the row pending.                        |
| Executor              | Tested at the application layer (`loadAndStartRun`, `completeRun`/`failRun`); the Inngest function body is a thin shell.                                                                   |

**Leak guard:** [`packages/scheduler/src/test-setup.ts`](../../packages/scheduler/src/test-setup.ts) (wired via vitest `setupFiles`) globally replaces `@mono/jobs`'s `inngest.send` with a `vi.fn()` that throws an instructional error. Reason: `NODE_ENV=test` under vitest makes the real client's `isDev=false`, so it would point at _production_ Inngest with the Doppler-injected `INNGEST_EVENT_KEY`. Tests that need to assert on emitted events override the mock locally with a recording fake.

What we **don't** test:

- Mocked Postgres — the lock semantics and unique constraints _are_ the system.
- Inngest's checkpointing / retry behavior — that's Inngest's contract.
- Crash-injection between `step.run` boundaries — testing Inngest, not us.
- Exhaustive timezone matrix — one DST tz is enough.

---

## Key design decisions (decision log)

1. **Postgres as truth, Inngest as runtime.** Don't put schedule definitions in Inngest — they need to be queryable, mutable, and joinable with the rest of the product.
2. **Don't materialize a UTC series.** Recompute `nextRunAt` after every fire. Self-healing across DST and tz edits.
3. **Skip `rrule.tzid`.** It leaks the system tz into `BYHOUR`. Floating-UTC + luxon conversion at the boundary is the only reliable pattern.
4. **Transactional outbox via two `step.run` calls.** DB commits before `inngest.send`. The pending row _is_ the outbox. No separate polling cron.
5. **Idempotency at two layers.** Composed Inngest event id + DB UNIQUE constraint. Either alone would be sufficient most of the time; both is cheap insurance.
6. **No retry/attempt columns.** Delegate everything to Inngest. Store only `inngestEventId` for correlation. Avoids building a parallel, weaker retry system.
7. **Best-effort delivery, no catch-up.** Missed occurrences during outages are dropped. Catch-up logic belongs in the handler if a task type needs it.
8. **Fixed timezone per schedule.** Snapshot at creation, change only on explicit edit. No cascade from user profile.
9. **Handler registry, not switch statements.** New task type = new file + one registry entry. Zero scheduler-internal changes.
10. **Cross-package events live in `@mono/jobs`.** Breaks producer↔consumer dependency cycles between feature packages.
11. **Inject the clock everywhere.** Makes every "wait for X seconds" test into "advance the clock". Cron entry points are the only place `new Date()` is called.
12. **`ON CONFLICT DO UPDATE` (no-op) over `DO NOTHING`.** Needed so `RETURNING` always yields a row, including on the dedupe path.

---

## Non-goals

- iCal sync / calendar integration
- EXDATE exceptions, organizer/attendee, RSVP
- Sub-minute precision (revisit with `step.sleepUntil` if ever needed)
- Cross-region replication (Neon handles this)
- Multi-step workflow DAGs (handlers can use Inngest steps internally)
