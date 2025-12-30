import { gateway } from "@ai-sdk/gateway";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import type { UIMessage } from "ai";
import { cookies, headers } from "next/headers";
import { z } from "zod";

import { getGatewayId } from "@microlearn/ai";
import { userActor } from "@microlearn/core-types";
import type { Message } from "@microlearn/conversation";
import {
  loadConversation,
  sendMessage,
  startConversation,
} from "@microlearn/conversation";
import { db } from "@microlearn/db/client";
import { NotFoundError } from "@microlearn/errors";

import { convertDbMessagesToUIMessages } from "~/app/(chat)/_lib/messages";
import { getSelectedModelId } from "~/app/(chat)/_lib/model";
import { auth } from "~/auth/server";
import { validateJson } from "~/lib/api-validation";

export const maxDuration = 30;

const chatRequestSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.custom<UIMessage>(),
});

interface TextPart {
  type: "text";
  text: string;
}

function isTextPart(part: { type: string }): part is TextPart {
  return part.type === "text";
}

function extractTextFromUIMessage(message: UIMessage): string {
  return message.parts.filter(isTextPart).map((part) => part.text).join("");
}

function generateTitle(text: string): string {
  const words = text.trim().split(/\s+/);
  const firstTenWords = words.slice(0, 10).join(" ");
  return firstTenWords || "New Conversation";
}

export async function POST(req: Request): Promise<Response> {
  const [session, cookieStore] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    cookies(),
  ]);

  if (!session?.user) {
    return Response.json(
      { error: "Authentication required" },
      { status: 401 },
    );
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

  // Try to load existing conversation
  try {
    const { messages } = await loadConversation(db, actor, {
      conversationId,
    });
    dbMessages = messages;
  } catch (error) {
    // If conversation doesn't exist, create one
    if (error instanceof NotFoundError) {
      const messageText = extractTextFromUIMessage(message);
      const title = generateTitle(messageText);
      await startConversation(db, actor, {
        id: conversationId,
        userId,
        title,
      });
    } else {
      throw error;
    }
  }

  await sendMessage(db, actor, {
    conversationId,
    role: "user",
    content: extractTextFromUIMessage(message),
  });

  const uiMessagesFromDb = convertDbMessagesToUIMessages(dbMessages);
  const allMessages = [...uiMessagesFromDb, message];

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: gateway(gatewayModelId),
        system: "You are a helpful AI tutor for microlearning.",
        messages: convertToModelMessages(allMessages),
      });

      void result.consumeStream();
      writer.merge(result.toUIMessageStream());
    },
    onFinish: async ({ messages: updatedMessages }) => {
      const lastMessage = updatedMessages[updatedMessages.length - 1];

      if (lastMessage?.role === "assistant") {
        const content = extractTextFromUIMessage(lastMessage);

        await sendMessage(db, actor, {
          conversationId,
          role: "assistant",
          content,
        });
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}

