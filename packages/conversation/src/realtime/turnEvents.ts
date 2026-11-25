import type { UIMessageChunk } from "ai";

import type { LoggedEvent, Unsubscribe } from "@mono/realtime";
import { appendEvent, subscribeEvents } from "@mono/realtime";

import type { TurnEvent } from "../types/TurnEvent";

const FLUSH_INTERVAL_MS = 50;

function turnEventKey(turnId: string): string {
  return `turn:${turnId}`;
}

export async function publishTurnEvent(
  turnId: string,
  event: TurnEvent,
): Promise<string> {
  return await appendEvent(turnEventKey(turnId), event);
}

export interface TurnChunkWriter {
  write: (chunk: UIMessageChunk) => void;
  // Publishes everything written so far. Returns the last event ID, or null if
  // nothing was ever published. Rethrows the first publish failure.
  flush: () => Promise<string | null>;
}

// Batches chunks into one event per interval so the model loop never waits on
// Redis. Batches are published strictly in order.
export function createTurnChunkWriter(turnId: string): TurnChunkWriter {
  let pending: UIMessageChunk[] = [];
  let chain: Promise<void> = Promise.resolve();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastEventId: string | null = null;
  let failure: Error | null = null;

  const publishPending = (): void => {
    timer = null;
    if (pending.length === 0) return;
    const chunks = pending;
    pending = [];
    chain = chain.then(async () => {
      if (failure) return;
      try {
        lastEventId = await publishTurnEvent(turnId, {
          type: "chunks",
          chunks,
        });
      } catch (error) {
        failure = error instanceof Error ? error : new Error(String(error));
      }
    });
  };

  return {
    write: (chunk) => {
      pending.push(chunk);
      timer ??= setTimeout(publishPending, FLUSH_INTERVAL_MS);
    },
    flush: async () => {
      if (timer) clearTimeout(timer);
      publishPending();
      await chain;
      if (failure) throw failure;
      return lastEventId;
    },
  };
}

export interface TurnEventHandlers {
  onEvent: (id: string, event: TurnEvent) => void;
  onError: (error: Error) => void;
}

function isTurnEvent(payload: unknown): payload is TurnEvent {
  if (typeof payload !== "object" || payload === null || !("type" in payload)) {
    return false;
  }
  return (
    payload.type === "chunks" ||
    payload.type === "reset" ||
    payload.type === "end"
  );
}

export async function subscribeTurnEvents(
  turnId: string,
  afterId: string | null,
  handlers: TurnEventHandlers,
): Promise<Unsubscribe> {
  return await subscribeEvents(turnEventKey(turnId), {
    afterId,
    onEvent: ({ id, payload }: LoggedEvent) => {
      if (isTurnEvent(payload)) handlers.onEvent(id, payload);
      else handlers.onError(new Error(`Malformed turn event ${id}`));
    },
    onError: handlers.onError,
  });
}
