"use client";

import type { FileUIPart, UIMessage } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { ModelId } from "@mono/ai";
import type { Message, TurnSnapshot } from "@mono/conversation";
import { convertDbMessagesToUIMessages } from "@mono/chat-utils";
import { ChevronDownIcon, SidebarTrigger } from "@mono/ui";

import type { AttachmentDraft } from "./chat-input";
import { ModelSelector } from "~/app/(app)/_components/model-selector";
import { useChatTurns } from "~/app/(app)/_lib/use-chat-turns";
import { useTRPC } from "~/trpc/react";
import { ChatInput } from "./chat-input";
import { Messages } from "./messages";
import { TurnOutcomeNotice } from "./turn-outcome-notice";

const AT_BOTTOM_THRESHOLD_PX = 100;

interface ChatProps {
  conversationId: string;
  initialMessages: Message[];
  selectedModelId: ModelId;
  isNew?: boolean;
  initialTurn?: TurnSnapshot | null;
}

export function Chat({
  conversationId,
  initialMessages,
  selectedModelId,
  isNew,
  initialTurn = null,
}: ChatProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const hasUpdatedUrl = useRef(false);
  const hasInvalidated = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);
  const [initialUIMessages] = useState(() =>
    convertDbMessagesToUIMessages(initialMessages),
  );

  const { messages, status, outcome, isStopping, send, stop, retry } =
    useChatTurns({
      conversationId,
      initialMessages: initialUIMessages,
      initialTurn,
    });

  const spendQuery = useQuery(
    trpc.billing.conversationSpend.queryOptions({ conversationId }),
  );
  const totalUsd = Number(spendQuery.data?.totalUsd ?? "0");
  const spendLabel =
    totalUsd > 0 ? `$${totalUsd.toFixed(2)} spent on this chat` : null;

  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current !== "ready" && status === "ready") {
      void queryClient.invalidateQueries({
        queryKey: trpc.billing.conversationSpend.pathKey(),
      });
    }
    prevStatus.current = status;
  }, [status, queryClient, trpc.billing.conversationSpend]);

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
    const fileParts: FileUIPart[] = attachments.map((a) => ({
      type: "file",
      mediaType: a.contentType,
      url: a.url,
      filename: a.filename,
    }));
    const parts: UIMessage["parts"] = text.trim().length
      ? [...fileParts, { type: "text", text }]
      : fileParts;
    void send(parts, attachmentIds);
  };

  const isGenerating = status !== "ready";

  return (
    <div className="bg-background flex h-full min-w-0 flex-col">
      <header className="bg-background sticky top-0 flex items-center gap-2 px-2 py-1.5">
        <SidebarTrigger className="cursor-pointer" />
        <ModelSelector selectedModelId={selectedModelId} />
      </header>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <Messages messages={messages} status={status} />
        {outcome && (
          <div className="mx-auto max-w-4xl px-2 pb-4 md:px-4">
            <TurnOutcomeNotice outcome={outcome} onRetry={() => void retry()} />
          </div>
        )}
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
        <ChatInput
          onSubmit={handleSubmit}
          disabled={isGenerating}
          isGenerating={isGenerating}
          isStopping={isStopping}
          onStop={stop}
        />
        {spendLabel && (
          <div className="text-muted-foreground self-end pr-1 text-xs">
            {spendLabel}
          </div>
        )}
      </div>
    </div>
  );
}
