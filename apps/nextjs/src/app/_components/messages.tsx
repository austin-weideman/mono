import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";

import { SparklesIcon } from "@microlearn/ui";

import { Message } from "./message";

interface MessagesProps {
  messages: UIMessage[];
  status: UseChatHelpers<UIMessage>["status"];
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
        <SparklesIcon size={32} className="text-primary" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-2xl font-bold">How can I help you?</h2>
        <p className="max-w-sm text-base text-muted-foreground">
          Ask me anything...
        </p>
      </div>
    </div>
  );
}

export function Messages({ messages, status }: MessagesProps) {
  return (
    <div className="mx-auto flex min-w-0 max-w-4xl flex-col">
      <div className="flex flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
        {messages.length === 0 && <EmptyState />}

        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isLoading={status === "streaming" && messages.length - 1 === index}
          />
        ))}
      </div>
    </div>
  );
}

