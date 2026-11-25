# Chat turns

A **turn** is one assistant reply: the user message that asked for it, the assistant message it fills in, and its lifecycle. Every reply in the app, from the assistant chat and the Lab's scientist agent alike, runs as a turn.

Turns are background jobs, not requests. A reply keeps generating when the browser refreshes, the tab closes, the network drops, a serverless function times out, or the app redeploys. Clients watch a turn through a resumable event stream and can stop or retry it.

Code: [`packages/conversation/`](../../packages/conversation/) (turn lifecycle, runner, jobs), [`packages/realtime/`](../../packages/realtime/) (Redis event log), schema: [`packages/db/src/chat-turn.ts`](../../packages/db/src/chat-turn.ts), events: [`packages/jobs/src/events/conversation/index.ts`](../../packages/jobs/src/events/conversation/index.ts), client: [`apps/nextjs/src/app/(app)/_lib/use-chat-turns.ts`](<../../apps/nextjs/src/app/(app)/_lib/use-chat-turns.ts>).

---

## TL;DR

- **Postgres** owns the turn (`chat_turn`) and the assistant message's content as of the last finished step.
- **Inngest** runs the turn as durable steps: `begin`, one step per model call, one step per tool call, `finish`.
- **Redis Streams** (Upstash) hold the turn's live events, so any client can replay from a cursor and then follow live.
- **One active turn per conversation**, enforced by a partial unique index. A second send gets `409`.
- **Every turn ends**: an `onFailure` handler, a sweeper cron, and a check when someone opens the stream make sure no turn stays `queued` or `streaming` forever.

---

## Lifecycle

```
queued ──begin──▶ streaming ──finish──▶ completed
   │                 │
   │                 ├── stop requested ──▶ cancelled
   │                 ├── retries exhausted ──▶ failed (agent_error)
   │                 └── no heartbeat for 5 min ──▶ failed (stalled)
   ├── stop requested ──▶ cancelled
   └── not started in 10 min ──▶ failed (never_started)
```

Check constraints keep the row consistent: `failure_kind` and `failure_reason` are set exactly when the status is `failed`; `finished_at` is set exactly when the status is terminal; `started_at` is empty while queued.

Every transition to a terminal status goes through `endTurnAndNotify`, a compare-and-set update (`WHERE status IN (...)`) followed by an `end` event. Whoever ends the turn first wins; the others become no-ops.

---

## Request flow

1. `POST /api/chat` with `kind: "send"` (or `kind: "retry"`) and a client-generated `turnId`. One transaction saves the user message, an empty assistant message, and a `queued` turn. Repeating the request with the same `turnId` returns the existing turn.
2. After commit the route sends the turn's Inngest event (`id: turnId`, so Inngest drops duplicates). If the send fails, the turn stays queued and is re-sent by the reconciler.
3. The client opens `GET /api/chat/turns/:turnId/stream` (Server-Sent Events) and renders chunks as they arrive.

Stop is `conversation.cancelTurn` (tRPC). A queued turn ends at once; a streaming turn gets `cancel_requested_at`, which the worker sees within one heartbeat (2s). The worker aborts the model call, saves the partial reply, and ends the turn as `cancelled`.

Retry archives the failed or stopped reply and starts a new turn on the same user message. Only the latest turn can be retried.

---

## The durable agent loop

`runChatTurn` owns the agent loop; agents (`ChatAgent` in `@mono/agent`) only supply the model, instructions, tools, and step limit.

- **Model step** (`model-<n>`): one `streamText` call with tool execution turned off, so the model only proposes tool calls. Chunks stream to Redis; when the call ends, the assistant message parts, the last event ID, and `completed_model_steps` are saved together. A retried step whose output is already saved skips the model call.
- **Tool step** (`tool-<toolCallId>`): executes one proposed tool call and saves its result. A saved result makes a re-run a no-op. Tools that write data use the `toolCallId` as an idempotency key (`experiment_run` has a unique `(campaign_id, tool_call_id)`).
- The model's history is rebuilt from Postgres at the start of each step, so no state lives in memory between steps.

Inngest checkpointing (`maxRuntime: 60s`) hands control back to Inngest before Vercel's 300s function limit, so a long turn spans several invocations. A single model call must still finish within one invocation.

The headless study script (`packages/experiment/scripts/run-study.ts`) runs the same `runChatTurn` with a step runner that calls each step directly.

---

## Event stream

Each turn has a Redis stream `turn:<turnId>` (6-hour TTL). `appendEvent` runs `XADD`, `EXPIRE`, and `PUBLISH` in one Lua script, so the stored log and the live feed share one order and one ID per event.

Event payloads (`TurnEvent`):

| Type     | Meaning                                                                                 |
| -------- | --------------------------------------------------------------------------------------- |
| `chunks` | AI SDK `UIMessageChunk`s, batched about every 50ms                                      |
| `reset`  | A model step restarted; replace the assistant message with the saved one, then continue |
| `end`    | Terminal status. Always the last event                                                  |

The SSE route sends each event with its Redis ID as the SSE `id:`. Reconnects send `Last-Event-ID` and receive only later events. The route closes itself after 270s; `EventSource` reconnects from its cursor. On page load the client renders the saved assistant message and resumes from `chat_turn.persisted_event_id`, so it neither misses nor repeats content.

---

## Reconciliation

`reconcileTurn` holds the recovery rules for an active turn:

- `streaming` with no heartbeat for 5 minutes: fail as `stalled`.
- `queued` for over 30 seconds: re-send the Inngest event.
- `queued` for over 10 minutes: fail as `never_started`.

It runs from the `conversation-sweep-turns` cron (every minute in development, every 15 minutes in production) and whenever a client opens a turn's stream.

---

## Observability

- `chat_turn` rows answer "what happened to this reply": status, timestamps per transition, failure kind and reason, heartbeat, completed model steps.
- Worker logs (Inngest logger) carry `turnId`, `conversationId`, `userId`, `agent`, step index, attempt, token counts, and durations.
- Inngest's dashboard shows each turn's run with one entry per step.

```sql
-- Turns that failed in the last day, with why
SELECT id, agent, failure_kind, failure_reason, completed_model_steps, finished_at
FROM chat_turn
WHERE status = 'failed' AND finished_at > now() - interval '1 day'
ORDER BY finished_at DESC;
```
