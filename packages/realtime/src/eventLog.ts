import type { Redis } from "@upstash/redis";

import { compareEventIds } from "./eventIds";
import { getRedis } from "./redis";

const LOG_TTL_SECS = 60 * 60 * 6;
const LOG_MAX_LENGTH = 100_000;
const READ_PAGE_SIZE = 1_000;
const SUBSCRIBE_TIMEOUT_MS = 10_000;
const PAYLOAD_FIELD = "p";

// XADD, EXPIRE and PUBLISH in one atomic call, so the log and the live feed
// always agree on order. The published message carries the entry's ID.
const APPEND_SCRIPT = `
local id = redis.call('XADD', KEYS[1], 'MAXLEN', '~', ARGV[3], '*', '${PAYLOAD_FIELD}', ARGV[1])
redis.call('EXPIRE', KEYS[1], ARGV[2])
redis.call('PUBLISH', KEYS[1], '{"id":"' .. id .. '","payload":' .. ARGV[1] .. '}')
return id
`;

type AppendScript = ReturnType<Redis["createScript"]>;

let appendScript: AppendScript | null = null;

function getAppendScript(): AppendScript {
  appendScript ??= getRedis().createScript<string>(APPEND_SCRIPT);
  return appendScript;
}

export interface LoggedEvent {
  id: string;
  payload: unknown;
}

export interface SubscribeOptions {
  afterId: string | null;
  onEvent: (event: LoggedEvent) => void;
  onError: (error: Error) => void;
}

export type Unsubscribe = () => Promise<void>;

export async function appendEvent(
  key: string,
  payload: unknown,
): Promise<string> {
  const id: unknown = await getAppendScript().exec(
    [key],
    [JSON.stringify(payload), String(LOG_TTL_SECS), String(LOG_MAX_LENGTH)],
  );
  if (typeof id !== "string") {
    throw new Error(`Unexpected event ID from ${key}: ${JSON.stringify(id)}`);
  }
  return id;
}

export async function readEvents(
  key: string,
  afterId: string | null,
): Promise<LoggedEvent[]> {
  const events: LoggedEvent[] = [];
  let start = afterId ? `(${afterId}` : "-";

  for (;;) {
    const page = await getRedis().xrange<Record<string, unknown>>(
      key,
      start,
      "+",
      READ_PAGE_SIZE,
    );
    const entries = Object.entries(page);
    for (const [id, fields] of entries) {
      events.push({ id, payload: fields[PAYLOAD_FIELD] });
    }
    const last = entries.at(-1);
    if (!last || entries.length < READ_PAGE_SIZE) return events;
    start = `(${last[0]}`;
  }
}

function isLoggedEvent(value: unknown): value is LoggedEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "payload" in value
  );
}

// Delivers every event after `afterId` exactly once and in order: live
// messages are buffered while the stored history is replayed, then deduped by ID.
export async function subscribeEvents(
  key: string,
  options: SubscribeOptions,
): Promise<Unsubscribe> {
  const { onEvent, onError } = options;
  let cursor = options.afterId;
  let replaying = true;
  const buffered: LoggedEvent[] = [];

  const deliver = (event: LoggedEvent): void => {
    if (cursor && compareEventIds(event.id, cursor) <= 0) return;
    cursor = event.id;
    onEvent(event);
  };

  const subscriber = getRedis().subscribe<unknown>([key]);
  const unsubscribe: Unsubscribe = () => subscriber.unsubscribe();

  subscriber.on("message", ({ message }) => {
    if (!isLoggedEvent(message)) {
      onError(new Error(`Malformed event on ${key}`));
      return;
    }
    if (replaying) buffered.push(message);
    else deliver(message);
  });
  subscriber.on("error", onError);

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`Timed out subscribing to ${key}`)),
        SUBSCRIBE_TIMEOUT_MS,
      );
      subscriber.on("subscribe", () => {
        clearTimeout(timeout);
        resolve();
      });
    });

    for (const event of await readEvents(key, options.afterId)) deliver(event);
    for (const event of buffered) deliver(event);
    buffered.length = 0;
    replaying = false;
  } catch (error) {
    await unsubscribe();
    throw error;
  }

  return unsubscribe;
}
