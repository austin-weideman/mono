"use client";

import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";

import type { Message } from "@mono/conversation";
import { convertDbMessagesToUIMessages } from "@mono/chat-utils";
import { ChevronDownIcon } from "@mono/ui";

import { useTRPC } from "~/trpc/react";
import { ChatInput } from "../../chat/_components/chat-input";
import { LabMessages } from "./lab-messages";

const AT_BOTTOM_THRESHOLD_PX = 100;

interface LabChatProps {
  conversationId: string;
  campaignId: string;
  scrambled: boolean;
  initialMessages: Message[];
  activeStreamId?: string | null;
}

export function LabChat({
  conversationId,
  campaignId,
  scrambled,
  initialMessages,
  activeStreamId,
}: LabChatProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);
  const activeStreamIdRef = useRef<string | null>(activeStreamId ?? null);
  const lastFetchController = useRef<AbortController | null>(null);
  const initialUIMessages = convertDbMessagesToUIMessages(initialMessages);

  // Same transport contract as the main chat: POST /api/chat (which routes to
  // the scientist agent for campaign conversations), then GET the SSE stream.
  const transport = useMemo(
    () =>
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
              attachmentIds: [],
            },
          };
        },
        prepareReconnectToStreamRequest: () => ({
          api: `/api/chat/${conversationId}/stream?streamId=${activeStreamIdRef.current ?? ""}`,
          credentials: "include",
        }),
        fetch: async (input, init) => {
          lastFetchController.current?.abort();
          const ctrl = new AbortController();
          lastFetchController.current = ctrl;

          if (init?.method === "GET") {
            return fetch(input, { ...init, signal: ctrl.signal });
          }

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

  // When a turn finishes, refetch the trajectory (new experiment rows) and the
  // campaign cost — the same "message done -> refresh" trick the main chat uses.
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === "streaming" && status === "ready") {
      void queryClient.invalidateQueries({
        queryKey: trpc.experiment.listExperimentRuns.pathKey(),
      });
      void queryClient.invalidateQueries({
        queryKey: trpc.billing.conversationSpend.pathKey(),
      });
    }
    prevStatus.current = status;
  }, [
    status,
    queryClient,
    trpc.experiment.listExperimentRuns,
    trpc.billing.conversationSpend,
  ]);

  useEffect(() => {
    return () => {
      lastFetchController.current?.abort();
    };
  }, [conversationId]);

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

  // campaignId is referenced so the chat re-keys cleanly per campaign.
  void campaignId;

  const handleSubmit = (text: string) => {
    if (!text.trim()) return;
    void sendMessage({ text }, { body: { attachmentIds: [] } });
  };

  return (
    <div className="bg-background flex h-full min-w-0 flex-col">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <LabMessages
          messages={messages}
          status={status}
          scrambled={scrambled}
        />
      </div>
      <div className="bg-background relative mx-auto flex w-full max-w-3xl flex-col gap-1 px-2 pb-3 md:px-4 md:pb-4">
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
      </div>
    </div>
  );
}
