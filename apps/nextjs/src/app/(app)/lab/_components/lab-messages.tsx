import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";

import { SparklesIcon } from "@mono/ui";

import { ThinkingIndicator } from "../../chat/_components/thinking-indicator";
import { LabMessage } from "./lab-message";

interface LabMessagesProps {
  messages: UIMessage[];
  status: UseChatHelpers<UIMessage>["status"];
  scrambled: boolean;
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="bg-primary/10 flex size-14 items-center justify-center rounded-full">
        <SparklesIcon size={28} className="text-primary" />
      </div>
      <h2 className="text-xl font-bold">Start the campaign</h2>
      <p className="text-muted-foreground max-w-sm text-sm">
        Send a message to kick off the scientist. In autonomous mode it will run
        the whole budget; in supervised mode it stops after each experiment for
        your go-ahead.
      </p>
    </div>
  );
}

export function LabMessages({ messages, status, scrambled }: LabMessagesProps) {
  const lastMessage = messages[messages.length - 1];
  const showPendingIndicator =
    (status === "submitted" || status === "streaming") &&
    lastMessage?.role === "user";

  return (
    <div className="mx-auto flex min-w-0 flex-col">
      <div className="flex flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
        {messages.length === 0 && <EmptyState />}

        {messages.map((message, index) => (
          <LabMessage
            key={message.id}
            message={message}
            isLoading={status === "streaming" && messages.length - 1 === index}
            scrambled={scrambled}
          />
        ))}

        {showPendingIndicator && (
          <div className="flex w-full items-start gap-2.5">
            <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full">
              <SparklesIcon size={14} />
            </div>
            <ThinkingIndicator />
          </div>
        )}
      </div>
    </div>
  );
}
