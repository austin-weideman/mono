"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";

import type { ModelId } from "@microlearn/ai";
import { convertDbMessagesToUIMessages } from "@microlearn/chat-utils";
import type { Message } from "@microlearn/conversation";
import { SidebarTrigger } from "@microlearn/ui";
import { ModelSelector } from "~/app/(chat)/_components/model-selector";
import { ChatInput } from "./chat-input";
import { Messages } from "./messages";

interface ChatProps {
  conversationId: string;
  initialMessages: Message[];
  selectedModelId: ModelId;
}

export function Chat({
  conversationId,
  initialMessages,
  selectedModelId,
}: ChatProps) {
  const hasUpdatedUrl = useRef(false);

  const { messages, sendMessage, status } = useChat<UIMessage>({
    id: conversationId,
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
  });

  // Update URL when first message is sent (only on new chat page)
  useEffect(() => {
    if (
      !hasUpdatedUrl.current &&
      messages.length > 0 &&
      window.location.pathname === "/chat"
    ) {
      hasUpdatedUrl.current = true;
      window.history.pushState({}, "", `/chat/${conversationId}`);
    }
  }, [messages.length, conversationId]);

  const handleSubmit = (text: string) => {
    void sendMessage({ text });
  };

  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5">
        <SidebarTrigger className="cursor-pointer" />
        <ModelSelector selectedModelId={selectedModelId} />
      </header>
      <div className="flex-1 overflow-y-auto">
        <Messages messages={messages} status={status} />
      </div>
      <div className="mx-auto flex w-full max-w-4xl gap-2 bg-background px-2 pb-3 md:px-4 md:pb-4">
        <ChatInput onSubmit={handleSubmit} disabled={status !== "ready"} />
      </div>
    </div>
  );
}

