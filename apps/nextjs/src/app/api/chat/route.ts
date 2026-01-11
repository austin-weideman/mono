import { consumeStream, createAgentUIStreamResponse } from "ai";
import type { UIMessage } from "ai";
import { cookies, headers } from "next/headers";
import { z } from "zod";

import { getGatewayId } from "@microlearn/ai";
import { createAssistantAgent } from "@microlearn/agent";
import {
  convertDbMessagesToUIMessages,
  extractTextFromUIMessage,
  generateTitleFromText,
} from "@microlearn/chat-utils";
import { userActor } from "@microlearn/core-types";
import type { Message } from "@microlearn/conversation";
import {
  loadConversation,
  sendMessage,
  startConversation,
} from "@microlearn/conversation";
import { db } from "@microlearn/db/client";
import { NotFoundError } from "@microlearn/errors";

import { getSelectedModelId } from "~/app/(chat)/_lib/model";
import { auth } from "~/auth/server";
import { validateJson } from "~/lib/api-validation";

export const maxDuration = 300;

const chatRequestSchema = z.object({
  conversationId: z.uuid(),
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

  const { conversationId, message } = validation.data;
  const userId = session.user.id;
  const actor = userActor(userId);

  const modelId = getSelectedModelId(cookieStore);
  const gatewayModelId = getGatewayId(modelId);

  let dbMessages: Message[] = [];

  try {
    const { messages } = await loadConversation(db, actor, { conversationId });
    dbMessages = messages;
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

  const uiMessagesFromDb = convertDbMessagesToUIMessages(dbMessages);
  const allMessages = [...uiMessagesFromDb, message];

  const { agent, close } = await createAssistantAgent({
    gatewayModelId,
    context: { db, actor },
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: allMessages,
    consumeSseStream: consumeStream,
    sendReasoning: true,
    onFinish: async ({ messages: updatedMessages, isAborted }) => {
      if (!isAborted) {
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (lastMessage?.role === "assistant") {
          await sendMessage(db, actor, {
            conversationId,
            role: "assistant",
            parts: lastMessage.parts,
          });
        }
      }

      await close();
    },
  });
}

