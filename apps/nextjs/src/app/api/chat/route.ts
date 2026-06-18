import type { UIMessage } from "ai";
import { cookies, headers } from "next/headers";
import { z } from "zod";

import { getGatewayId } from "@mono/ai";
import { linkAttachmentsToMessage } from "@mono/attachment";
import { extractTextFromUIMessage } from "@mono/chat-utils";
import {
  generateTitleFromText,
  loadConversation,
  sendMessage,
  setActiveStream,
  startConversation,
} from "@mono/conversation";
import { userActor } from "@mono/core-types";
import { db } from "@mono/db/client";
import { NotFoundError } from "@mono/errors";
import { getCampaignByConversationId } from "@mono/experiment";
import { inngest } from "@mono/jobs";
import {
  conversationRunAssistantEvent,
  conversationRunScientistEvent,
} from "@mono/jobs/events/conversation";

import { getSelectedModelId } from "~/app/(app)/_lib/model";
import { auth } from "~/auth/server";
import { validateJson } from "~/lib/api-validation";
import { chatBurstRateLimit, chatSustainedRateLimit } from "~/lib/rate-limit";

const MAX_ATTACHMENTS_PER_MESSAGE = 10;

const chatRequestSchema = z.object({
  conversationId: z.uuid(),
  streamId: z.uuid(),
  message: z.custom<UIMessage>(),
  attachmentIds: z.array(z.uuid()).max(MAX_ATTACHMENTS_PER_MESSAGE).default([]),
});

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

  const { conversationId, streamId, message, attachmentIds } = validation.data;
  const userId = session.user.id;
  const actor = userActor(userId);

  const modelId = getSelectedModelId(cookieStore);
  const gatewayModelId = getGatewayId(modelId);

  try {
    await loadConversation(db, actor, { conversationId });
  } catch (error) {
    if (error instanceof NotFoundError) {
      const messageText = extractTextFromUIMessage(message);
      const title = generateTitleFromText(messageText);
      await startConversation(db, actor, { id: conversationId, userId, title });
    } else {
      throw error;
    }
  }

  await db.transaction(async (tx) => {
    const persisted = await sendMessage(tx, actor, {
      conversationId,
      role: "user",
      parts: message.parts,
    });
    if (attachmentIds.length > 0) {
      await linkAttachmentsToMessage(tx, actor, {
        messageId: persisted.id,
        conversationId,
        attachmentIds,
      });
    }
  });

  await setActiveStream(db, actor, { conversationId, streamId });

  // A conversation backed by a campaign runs the scientist agent; everything
  // else runs the assistant. Both feed the same realtime channel + SSE route.
  const campaign = await getCampaignByConversationId(db, conversationId);

  await inngest.send(
    campaign
      ? conversationRunScientistEvent.create(
          {
            conversationId,
            campaignId: campaign.id,
            userId,
            streamId,
            gatewayModelId,
          },
          { id: streamId },
        )
      : conversationRunAssistantEvent.create(
          { conversationId, userId, streamId, gatewayModelId },
          { id: streamId },
        ),
  );

  return Response.json({ streamId }, { status: 202 });
}
