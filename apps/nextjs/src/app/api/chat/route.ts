import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import type { UIMessage } from "ai";
import { headers } from "next/headers";
import { z } from "zod";

import {
  loadConversation,
  sendMessage,
  startConversation,
} from "@microlearn/conversation";
import type { Message } from "@microlearn/conversation";
import { db } from "@microlearn/db/client";
import { NotFoundError } from "@microlearn/errors";

import { auth } from "~/auth/server";
import { validateJson } from "~/lib/api-validation";

export const maxDuration = 30;

const chatRequestSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.custom<UIMessage>(),
});

function convertDbMessagesToUIMessages(messages: Message[]): UIMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: "text" as const, text: msg.content }],
  }));
}

function extractTextFromUIMessage(message: UIMessage): string {
  const textParts = message.parts.filter((part) => part.type === "text");
  return textParts.map((part) => part.text).join("");
}

function generateTitle(text: string): string {
  const words = text.trim().split(/\s+/);
  const firstTenWords = words.slice(0, 10).join(" ");
  return firstTenWords || "New Conversation";
}

export async function POST(req: Request): Promise<Response> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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

  let dbMessages: Message[] = [];

  // Try to load existing conversation
  try {
    const { messages } = await loadConversation(db, {
      conversationId,
      userId,
    });
    dbMessages = messages;
  } catch (error) {
    // If conversation doesn't exist, create one
    if (error instanceof NotFoundError) {
      const messageText = extractTextFromUIMessage(message);
      const title = generateTitle(messageText);
      await startConversation(db, {
        id: conversationId,
        userId,
        title,
      });
    } else {
      throw error;
    }
  }

  await sendMessage(db, {
    conversationId,
    userId,
    role: "user",
    content: extractTextFromUIMessage(message),
  });

  const uiMessagesFromDb = convertDbMessagesToUIMessages(dbMessages);
  const allMessages = [...uiMessagesFromDb, message];

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: openai("gpt-4o-mini"),
        system: "You are a helpful AI tutor for microlearning.",
        messages: convertToModelMessages(allMessages),
      });

      void result.consumeStream();
      writer.merge(result.toUIMessageStream());
    },
    onFinish: async ({ messages: updatedMessages }) => {
      const lastMessage = updatedMessages[updatedMessages.length - 1];

      if (lastMessage?.role === "assistant") {
        const textParts = lastMessage.parts.filter(
          (part) => part.type === "text",
        );
        const content = textParts.map((part) => part.text).join("");

        await sendMessage(db, {
          conversationId,
          userId,
          role: "assistant",
          content,
        });
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}

