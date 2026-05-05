import type { UIMessage } from "ai";
import { cookies, headers } from "next/headers";
import { z } from "zod";

import { getGatewayId } from "@microlearn/ai";
import {
  extractTextFromUIMessage,
  generateTitleFromText,
} from "@microlearn/chat-utils";
import {
  loadConversation,
  sendMessage,
  setActiveStream,
  startConversation,
} from "@microlearn/conversation";
import { conversationRunAssistantEvent } from "@microlearn/conversation/jobs";
import { userActor } from "@microlearn/core-types";
import { db } from "@microlearn/db/client";
import { NotFoundError } from "@microlearn/errors";
import { inngest } from "@microlearn/jobs";

import { getSelectedModelId } from "~/app/(app)/_lib/model";
import { auth } from "~/auth/server";
import { validateJson } from "~/lib/api-validation";

const chatRequestSchema = z.object({
  conversationId: z.uuid(),
  streamId: z.uuid(),
  message: z.custom<UIMessage>(),
});

export async function POST(req: Request): Promise<Response> {
  const [session, cookieStore] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    cookies(),
  ]);

  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const validation = await validateJson(req, chatRequestSchema);
  if (!validation.success) {
    return validation.error;
  }

  const { conversationId, streamId, message } = validation.data;
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

  await sendMessage(db, actor, {
    conversationId,
    role: "user",
    parts: message.parts,
  });

  await setActiveStream(db, actor, { conversationId, streamId });

  await inngest.send(
    conversationRunAssistantEvent.create(
      { conversationId, userId, streamId, gatewayModelId },
      { id: streamId },
    ),
  );

  return Response.json({ streamId }, { status: 202 });
}
