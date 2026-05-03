import type { UIMessageChunk } from "ai";
import { headers } from "next/headers";
import { UI_MESSAGE_STREAM_HEADERS } from "ai";
import { z } from "zod";

import { loadConversation } from "@microlearn/conversation";
import { userActor } from "@microlearn/core-types";
import { db } from "@microlearn/db/client";
import { ForbiddenError, NotFoundError } from "@microlearn/errors";
import { streamChannel } from "@microlearn/realtime";

import { auth } from "~/auth/server";

export const maxDuration = 300;

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

const streamIdSchema = z.uuid();

function isTerminalChunk(chunk: UIMessageChunk): boolean {
  return chunk.type === "finish" || chunk.type === "error";
}

export async function GET(
  req: Request,
  { params }: RouteContext,
): Promise<Response> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { conversationId } = await params;
  const url = new URL(req.url);
  const streamIdParse = streamIdSchema.safeParse(
    url.searchParams.get("streamId"),
  );
  if (!streamIdParse.success) {
    return Response.json({ error: "Invalid streamId" }, { status: 400 });
  }
  const streamId = streamIdParse.data;
  const actor = userActor(session.user.id);

  try {
    await loadConversation(db, actor, { conversationId });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    if (err instanceof ForbiddenError) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    throw err;
  }

  const channel = streamChannel(streamId);
  let unsubscribe: (() => void) | null = null;
  let isClosed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      const close = () => {
        if (isClosed) return;
        isClosed = true;
        unsubscribe?.();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      try {
        unsubscribe = await channel.subscribe({
          events: ["ai.chunk"] as const,
          history: true,
          onData: (event: { data: UIMessageChunk }) => {
            if (isClosed) return;
            const chunk = event.data;
            try {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
              );
            } catch {
              close();
              return;
            }
            if (isTerminalChunk(chunk)) {
              close();
            }
          },
        });
        if (isClosed) unsubscribe();
      } catch {
        close();
      }
    },
    cancel() {
      isClosed = true;
      unsubscribe?.();
    },
  });

  return new Response(stream, { headers: UI_MESSAGE_STREAM_HEADERS });
}
