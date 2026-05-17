"use client";

import type { FileUIPart, UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";

import type { ModelId } from "@mono/ai";
import type { Message } from "@mono/conversation";
import { convertDbMessagesToUIMessages } from "@mono/chat-utils";
import { ChevronDownIcon, SidebarTrigger } from "@mono/ui";

import type { AttachmentDraft } from "./chat-input";
import { ModelSelector } from "~/app/(app)/_components/model-selector";
import { useTRPC } from "~/trpc/react";
import { ChatInput } from "./chat-input";
import { Messages } from "./messages";

const AT_BOTTOM_THRESHOLD_PX = 100;

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

  // Tracks the streamId that is currently associated with this conversation:
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
        prepareSendMessagesRequest: ({ messages, body }) => {
          const streamId = crypto.randomUUID();
          activeStreamIdRef.current = streamId;
          const attachmentIds =
            (body?.attachmentIds as string[] | undefined) ?? [];
          return {
            body: {
              conversationId,
              streamId,
              message: messages.at(-1),
              attachmentIds,
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

          // Send path: POST first, then GET. The stream endpoint requires
          // the conversation row to exist (it auth-checks via loadConversation),
          // and for a brand-new chat that row is created lazily by POST — so
          // firing them in parallel races and the GET 404s when it loses.
          // History buffering on the realtime channel covers the gap between
          // POST returning and GET subscribing.
          const body = JSON.parse(init?.body as string) as { streamId: string };
          const postRes = await fetch("/api/chat", {
            ...init,
            signal: ctrl.signal,
          });
          if (!postRes.ok) return postRes;
          return fetch(
            `/api/chat/${conversationId}/stream?streamId=${body.streamId}`,
            {
              method: "GET",
              credentials: "include",
              signal: ctrl.signal,
            },
          );
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

  const spendQuery = useQuery(
    trpc.billing.conversationSpend.queryOptions({ conversationId }),
  );
  const totalUsd = Number(spendQuery.data?.totalUsd ?? "0");
  const spendLabel =
    totalUsd > 0 ? `$${totalUsd.toFixed(2)} spent on this chat` : null;

  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === "streaming" && status === "ready") {
      void queryClient.invalidateQueries({
        queryKey: trpc.billing.conversationSpend.pathKey(),
      });
    }
    prevStatus.current = status;
  }, [status, queryClient, trpc.billing.conversationSpend]);

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

  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const checkIsAtBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsAtBottom(
      el.scrollHeight - el.scrollTop - el.clientHeight < AT_BOTTOM_THRESHOLD_PX,
    );
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkIsAtBottom();
    el.addEventListener("scroll", checkIsAtBottom, { passive: true });
    return () => el.removeEventListener("scroll", checkIsAtBottom);
  }, [checkIsAtBottom]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      messages.length > prevMessageCount.current &&
      lastMessage?.role === "user"
    ) {
      scrollToBottom();
    }
    prevMessageCount.current = messages.length;
    checkIsAtBottom();
  }, [messages, scrollToBottom, checkIsAtBottom]);

  const handleSubmit = (text: string, attachments: AttachmentDraft[]) => {
    const attachmentIds = attachments.map((a) => a.id);
    if (attachments.length === 0) {
      void sendMessage({ text }, { body: { attachmentIds } });
      return;
    }
    const fileParts: FileUIPart[] = attachments.map((a) => ({
      type: "file",
      mediaType: a.contentType,
      url: a.url,
      filename: a.filename,
    }));
    const parts: UIMessage["parts"] = text.trim().length
      ? [...fileParts, { type: "text", text }]
      : fileParts;
    void sendMessage({ parts }, { body: { attachmentIds } });
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
      <div className="bg-background relative mx-auto flex w-full max-w-4xl flex-col gap-1 px-2 pb-3 md:px-4 md:pb-4">
        {!isAtBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            className="bg-background hover:bg-muted absolute -top-12 left-1/2 flex size-9 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border shadow-sm transition-colors"
          >
            <ChevronDownIcon size={18} />
          </button>
        )}
        <ChatInput onSubmit={handleSubmit} disabled={status !== "ready"} />
        {spendLabel && (
          <div className="text-muted-foreground self-end pr-1 text-xs">
            {spendLabel}
          </div>
        )}
      </div>
    </div>
  );
}
