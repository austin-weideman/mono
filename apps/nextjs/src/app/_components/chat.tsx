"use client";

import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";

import type { ModelId } from "@microlearn/ai";
import type { Message } from "@microlearn/conversation";
import { convertDbMessagesToUIMessages } from "@microlearn/chat-utils";
import { SidebarTrigger } from "@microlearn/ui";

import { ModelSelector } from "~/app/(chat)/_components/model-selector";
import { useTRPC } from "~/trpc/react";
import { ChatInput } from "./chat-input";
import { Messages } from "./messages";

interface ChatProps {
  conversationId: string;
  initialMessages: Message[];
  selectedModelId: ModelId;
  isNew?: boolean;
  activeStreamId?: string | null;
}

export function Chat({
  conversationId,
  initialMessages,
  selectedModelId,
  isNew,
  activeStreamId,
}: ChatProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const hasUpdatedUrl = useRef(false);
  const hasInvalidated = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  // Tracks the streamId currently associated with this conversation:
  // - Initialized from the server-rendered activeStreamId for resume on mount.
  // - Updated to a fresh UUID on each new send.
  // - Used by prepareReconnectToStreamRequest if useChat re-mounts mid-stream.
  const activeStreamIdRef = useRef<string | null>(activeStreamId ?? null);
  // useChat (AI SDK 6) does NOT propagate an AbortSignal through reconnect
  // fetches, so without manual cancellation each navigation-back leaks an SSE
  // subscription. We track the latest in-flight fetch ourselves and abort the
  // prior one on every new fetch.
  const lastFetchController = useRef<AbortController | null>(null);
  const initialUIMessages = convertDbMessagesToUIMessages(initialMessages);

  const transport = useMemo(
    () =>
      // The transport's callbacks read/write activeStreamIdRef, but only inside
      // request-time closures — not during render. The lint rule can't see this
      // statically, so we suppress here.
      // eslint-disable-next-line react-hooks/refs
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => {
          const streamId = crypto.randomUUID();
          activeStreamIdRef.current = streamId;
          return {
            body: {
              conversationId,
              streamId,
              message: messages.at(-1),
            },
          };
        },
        prepareReconnectToStreamRequest: () => ({
          api: `/api/chat/${conversationId}/stream?streamId=${activeStreamIdRef.current ?? ""}`,
          credentials: "include",
        }),
        fetch: async (input, init) => {
          // Abort any previous in-flight fetch so SSE subscribers can't
          // accumulate when useChat fires a fresh reconnect on navigation.
          // useChat (AI SDK 6) does not propagate an AbortSignal of its own,
          // so we have to manage cancellation manually.
          lastFetchController.current?.abort();
          const ctrl = new AbortController();
          lastFetchController.current = ctrl;

          if (init?.method === "GET") {
            // Reconnect path: useChat already prepared the URL.
            return fetch(input, { ...init, signal: ctrl.signal });
          }

          // Send path: fire POST and GET in parallel using the same
          // client-generated streamId.
          const body = JSON.parse(init?.body as string) as { streamId: string };
          const [getRes] = await Promise.all([
            fetch(
              `/api/chat/${conversationId}/stream?streamId=${body.streamId}`,
              {
                method: "GET",
                credentials: "include",
                signal: ctrl.signal,
              },
            ),
            fetch("/api/chat", { ...init, signal: ctrl.signal }),
          ]);
          return getRes;
        },
      }),
    [conversationId],
  );

  const { messages, sendMessage, status } = useChat<UIMessage>({
    id: conversationId,
    messages: initialUIMessages,
    resume: Boolean(activeStreamId),
    transport,
  });

  // Abort any in-flight stream fetch when conversation switches or component
  // unmounts. Otherwise leaving an actively-streaming chat for one with no
  // active stream leaves the SSE subscription dangling.
  useEffect(() => {
    return () => {
      lastFetchController.current?.abort();
    };
  }, [conversationId]);

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

  // Invalidate sidebar conversation list when new conversation starts
  useEffect(() => {
    if (isNew && messages.length > 0 && !hasInvalidated.current) {
      hasInvalidated.current = true;
      void queryClient.invalidateQueries({
        queryKey: trpc.conversation.list.pathKey(),
      });
    }
  }, [isNew, messages.length, queryClient, trpc.conversation.list]);

  const scrollToBottom = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      messages.length > prevMessageCount.current &&
      lastMessage?.role === "user"
    ) {
      scrollToBottom();
    }
    prevMessageCount.current = messages.length;
  }, [messages, scrollToBottom]);

  const handleSubmit = (text: string) => {
    void sendMessage({ text });
  };

  return (
    <div className="bg-background flex h-full min-w-0 flex-col">
      <header className="bg-background sticky top-0 flex items-center gap-2 px-2 py-1.5">
        <SidebarTrigger className="cursor-pointer" />
        <ModelSelector selectedModelId={selectedModelId} />
      </header>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <Messages messages={messages} status={status} />
      </div>
      <div className="bg-background mx-auto flex w-full max-w-4xl gap-2 px-2 pb-3 md:px-4 md:pb-4">
        <ChatInput onSubmit={handleSubmit} disabled={status !== "ready"} />
      </div>
    </div>
  );
}
