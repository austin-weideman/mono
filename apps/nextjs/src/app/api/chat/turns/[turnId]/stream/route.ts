import { headers } from "next/headers";
import { z } from "zod";

import type { TurnEvent } from "@mono/conversation";
import { subscribeToTurn } from "@mono/conversation";
import { userActor } from "@mono/core-types";
import { db } from "@mono/db/client";

import { auth } from "~/auth/server";
import { appErrorResponse } from "~/lib/api-errors";

export const maxDuration = 300;

// Close a little before maxDuration; EventSource reconnects with Last-Event-ID.
const CONNECTION_LIFETIME_MS = 270_000;
const KEEPALIVE_INTERVAL_MS = 15_000;
const CLIENT_RETRY_MS = 1_000;

const SSE_HEADERS = {
  "content-type": "text/event-stream",
  "cache-control": "no-cache, no-transform",
  connection: "keep-alive",
  "x-accel-buffering": "no",
};

const turnIdSchema = z.uuid();
const eventIdSchema = z.string().regex(/^\d+-\d+$/);

interface RouteContext {
  params: Promise<{ turnId: string }>;
}

function encodeEvent(id: string | null, event: TurnEvent): string {
  const idLine = id ? `id: ${id}\n` : "";
  return `${idLine}data: ${JSON.stringify(event)}\n\n`;
}

export async function GET(
  req: Request,
  { params }: RouteContext,
): Promise<Response> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const turnId = turnIdSchema.safeParse((await params).turnId);
  if (!turnId.success) {
    return Response.json({ error: "Invalid turn id" }, { status: 400 });
  }

  const rawAfter =
    req.headers.get("last-event-id") ??
    new URL(req.url).searchParams.get("after");
  const after = rawAfter ? eventIdSchema.safeParse(rawAfter) : null;
  if (after && !after.success) {
    return Response.json({ error: "Invalid event id" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  const state = { closed: false };
  let keepalive: ReturnType<typeof setInterval> | null = null;
  let lifetime: ReturnType<typeof setTimeout> | null = null;
  let unsubscribe: (() => Promise<void>) | null = null;

  const send = (text: string): void => {
    if (state.closed || !controller) return;
    try {
      controller.enqueue(encoder.encode(text));
    } catch {
      close();
    }
  };

  const close = (): void => {
    if (state.closed) return;
    state.closed = true;
    if (keepalive) clearInterval(keepalive);
    if (lifetime) clearTimeout(lifetime);
    void unsubscribe?.();
    try {
      controller?.close();
    } catch {
      // already closed by the client
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    start: (ctrl) => {
      controller = ctrl;
      send(`retry: ${CLIENT_RETRY_MS}\n\n`);
    },
    cancel: () => close(),
  });

  try {
    unsubscribe = await subscribeToTurn(db, userActor(session.user.id), {
      turnId: turnId.data,
      afterId: after?.data ?? null,
      onEvent: (id, event) => {
        send(encodeEvent(id, event));
        if (event.type === "end") close();
      },
      onError: (error) => {
        console.error("turn stream subscription error", {
          turnId: turnId.data,
          error: error.message,
        });
        close();
      },
    });
  } catch (error) {
    close();
    return appErrorResponse(error);
  }

  if (state.closed) {
    void unsubscribe();
  } else {
    keepalive = setInterval(
      () => send(": keepalive\n\n"),
      KEEPALIVE_INTERVAL_MS,
    );
    lifetime = setTimeout(close, CONNECTION_LIFETIME_MS);
  }

  return new Response(stream, { headers: SSE_HEADERS });
}
