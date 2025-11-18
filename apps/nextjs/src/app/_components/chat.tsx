"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";

import type { Message } from "@microlearn/conversation";

import { ChatInput } from "./chat-input";
import { Messages } from "./messages";

interface ChatProps {
  conversationId: string | null;
  initialMessages: Message[];
}

function convertDbMessagesToUIMessages(messages: Message[]): UIMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: "text" as const, text: msg.content }],
  }));
}

export function Chat({ conversationId, initialMessages }: ChatProps) {
  const router = useRouter();

  const { messages, sendMessage, status } = useChat<UIMessage>({
    id: conversationId ?? undefined,
    messages: convertDbMessagesToUIMessages(initialMessages),
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => {
        return {
          body: {
            conversationId,
            message: messages.at(-1),
          },
        };
      },
    }),
    onData: (dataPart) => {
      if (dataPart.type === "data-conversation-id") {
        const newConversationId = (
          dataPart.data as { conversationId: string }
        ).conversationId;
        router.push(`/chat/${newConversationId}`);
      }
    },
  });

  const handleSubmit = (text: string) => {
    void sendMessage({ text });
  };

  return (
    <div className="flex h-dvh min-w-0 flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <Messages messages={messages} status={status} />
      </div>
      <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
        <ChatInput onSubmit={handleSubmit} disabled={status !== "ready"} />
      </div>
    </div>
  );
}

