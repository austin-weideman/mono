"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { Message, TurnEvent, TurnSnapshot } from "@mono/conversation";
import { convertDbMessagesToUIMessages } from "@mono/chat-utils";
import { ChevronDownIcon } from "@mono/ui";

import { useChatTurns } from "~/app/(app)/_lib/use-chat-turns";
import { useTRPC } from "~/trpc/react";
import { ChatInput } from "../../chat/_components/chat-input";
import { TurnOutcomeNotice } from "../../chat/_components/turn-outcome-notice";
import { LabMessages } from "./lab-messages";

const AT_BOTTOM_THRESHOLD_PX = 100;

interface LabChatProps {
  conversationId: string;
  scrambled: boolean;
  initialMessages: Message[];
  initialTurn: TurnSnapshot | null;
}

function hasToolResult(event: TurnEvent): boolean {
  return (
    event.type === "chunks" &&
    event.chunks.some(
      (chunk) =>
        chunk.type === "tool-output-available" ||
        chunk.type === "tool-output-error",
    )
  );
}

export function LabChat({
  conversationId,
  scrambled,
  initialMessages,
  initialTurn,
}: LabChatProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);
  const [initialUIMessages] = useState(() =>
    convertDbMessagesToUIMessages(initialMessages),
  );

  // Each finished experiment is a tool result; refresh the trajectory as it lands.
  const onEvent = useCallback(
    (event: TurnEvent) => {
      if (!hasToolResult(event)) return;
      void queryClient.invalidateQueries({
        queryKey: trpc.experiment.listExperimentRuns.pathKey(),
      });
    },
    [queryClient, trpc.experiment.listExperimentRuns],
  );

  const { messages, status, outcome, isStopping, send, stop, retry } =
    useChatTurns({
      conversationId,
      initialMessages: initialUIMessages,
      initialTurn,
      onEvent,
    });

  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current !== "ready" && status === "ready") {
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

  const handleSubmit = (text: string) => {
    if (!text.trim()) return;
    void send([{ type: "text", text }], []);
  };

  const isGenerating = status !== "ready";

  return (
    <div className="bg-background flex h-full min-w-0 flex-col">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <LabMessages
          messages={messages}
          status={status}
          scrambled={scrambled}
        />
        {outcome && (
          <div className="mx-auto max-w-3xl px-2 pb-4 md:px-4">
            <TurnOutcomeNotice outcome={outcome} onRetry={() => void retry()} />
          </div>
        )}
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
        <ChatInput
          onSubmit={handleSubmit}
          disabled={isGenerating}
          isGenerating={isGenerating}
          isStopping={isStopping}
          onStop={stop}
        />
      </div>
    </div>
  );
}
