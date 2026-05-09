import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { motion } from "framer-motion";

import { popMotion, riseMotion, SparklesIcon, withDelay } from "@microlearn/ui";

import { Message } from "./message";

interface MessagesProps {
  messages: UIMessage[];
  status: UseChatHelpers<UIMessage>["status"];
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
      <motion.div
        {...popMotion}
        className="bg-primary/10 flex size-14 items-center justify-center rounded-full"
      >
        <SparklesIcon size={32} className="text-primary" />
      </motion.div>
      <div className="flex flex-col items-center gap-1 text-center">
        <motion.h2
          {...withDelay(riseMotion, 0.15)}
          className="text-2xl font-bold"
        >
          How can I help you?
        </motion.h2>
        <motion.p
          {...withDelay(riseMotion, 0.25)}
          className="text-muted-foreground max-w-sm text-base"
        >
          Ask me anything...
        </motion.p>
      </div>
    </div>
  );
}

export function Messages({ messages, status }: MessagesProps) {
  return (
    <div className="mx-auto flex max-w-4xl min-w-0 flex-col">
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
