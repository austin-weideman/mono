import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";

import { Message } from "./message";

interface MessagesProps {
  messages: UIMessage[];
  status: UseChatHelpers<UIMessage>["status"];
}

export function Messages({ messages, status }: MessagesProps) {
  return (
    <div className="mx-auto flex min-w-0 max-w-4xl flex-col">
      <div className="flex flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center py-12 text-muted-foreground">
            Start a conversation
          </div>
        )}

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

