import type { UIMessage } from "ai";
import { cookies, headers } from "next/headers";
import { z } from "zod";

import type { StartedTurn } from "@mono/conversation";
import { getGatewayId } from "@mono/ai";
import { linkAttachmentsToMessage } from "@mono/attachment";
import { extractTextFromUIMessage } from "@mono/chat-utils";
import {
  dispatchTurn,
  ensureConversation,
  generateTitleFromText,
  retryTurn,
  startTurn,
  toTurnSnapshot,
} from "@mono/conversation";
import { userActor } from "@mono/core-types";
import { db } from "@mono/db/client";
import { getCampaignByConversationId } from "@mono/experiment";

import { getSelectedModelId } from "~/app/(app)/_lib/model";
import { auth } from "~/auth/server";
import { appErrorResponse } from "~/lib/api-errors";
import { validateJson } from "~/lib/api-validation";
import { chatBurstRateLimit, chatSustainedRateLimit } from "~/lib/rate-limit";

const MAX_ATTACHMENTS_PER_MESSAGE = 10;

const chatRequestSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("send"),
    conversationId: z.uuid(),
    turnId: z.uuid(),
    message: z.object({
      id: z.uuid(),
      parts: z.array(z.custom<UIMessage["parts"][number]>()).min(1),
    }),
    attachmentIds: z
      .array(z.uuid())
      .max(MAX_ATTACHMENTS_PER_MESSAGE)
      .default([]),
  }),
  z.object({
    kind: z.literal("retry"),
    turnId: z.uuid(),
    retryOfTurnId: z.uuid(),
  }),
]);

type ChatRequest = z.infer<typeof chatRequestSchema>;

async function startRequestedTurn(
  request: ChatRequest,
  userId: string,
  gatewayModelId: string,
): Promise<StartedTurn> {
  const actor = userActor(userId);

  switch (request.kind) {
    case "send": {
      const { conversationId, turnId, message, attachmentIds } = request;
      const campaign = await getCampaignByConversationId(db, conversationId);
      return await db.transaction(async (tx) => {
        await ensureConversation(tx, actor, {
          id: conversationId,
          userId,
          title: generateTitleFromText(
            extractTextFromUIMessage({ ...message, role: "user" }),
          ),
        });
        const started = await startTurn(tx, actor, {
          turnId,
          conversationId,
          agent: campaign ? "scientist" : "assistant",
          gatewayModelId,
          userMessage: message,
        });
        if (started.created && attachmentIds.length > 0) {
          await linkAttachmentsToMessage(tx, actor, {
            messageId: started.turn.userMessageId,
            conversationId,
            attachmentIds,
          });
        }
        return started;
      });
    }
    case "retry":
      return await db.transaction((tx) =>
        retryTurn(tx, actor, {
          turnId: request.turnId,
          retryOfTurnId: request.retryOfTurnId,
          gatewayModelId,
        }),
      );
  }
}

export async function POST(req: Request): Promise<Response> {
  const [session, cookieStore] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    cookies(),
  ]);

  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const [burst, sustained] = await Promise.all([
    chatBurstRateLimit.limit(session.user.id),
    chatSustainedRateLimit.limit(session.user.id),
  ]);
  const limited = !burst.success
    ? burst
    : !sustained.success
      ? sustained
      : null;
  if (limited) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((limited.reset - Date.now()) / 1000),
    );
    return Response.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      },
    );
  }

  const validation = await validateJson(req, chatRequestSchema);
  if (!validation.success) {
    return validation.error;
  }

  const gatewayModelId = getGatewayId(getSelectedModelId(cookieStore));

  let started: StartedTurn;
  try {
    started = await startRequestedTurn(
      validation.data,
      session.user.id,
      gatewayModelId,
    );
  } catch (error) {
    return appErrorResponse(error);
  }

  // A lost dispatch leaves the turn queued; the turn sweeper re-sends it.
  try {
    await dispatchTurn(started.turn);
  } catch (error) {
    console.error("chat turn dispatch failed", {
      turnId: started.turn.id,
      conversationId: started.turn.conversationId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return Response.json(
    { turn: toTurnSnapshot(started.turn) },
    { status: started.created ? 202 : 200 },
  );
}
