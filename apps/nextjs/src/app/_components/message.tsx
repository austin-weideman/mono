import type { UIMessage } from "ai";

import { cn, Markdown, SparklesIcon } from "@microlearn/ui";

import { MessageActions } from "./message-actions";
import { Reasoning } from "./reasoning";
import { ThinkingIndicator } from "./thinking-indicator";

interface MessageProps {
  message: UIMessage;
  isLoading?: boolean;
}

export function Message({ message, isLoading }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div className="group/message w-full" data-role={message.role}>
      <div
        className={cn("flex w-full items-start gap-2.5", {
          "justify-end": isUser,
          "justify-start": !isUser,
        })}
      >
        {!isUser && (
          <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full">
            <SparklesIcon size={14} />
          </div>
        )}

        {/* min-w-0 + break-all: flex children don't shrink below content size by default.
            Without these, long unbroken strings (URLs) overflow the container. */}
        <div
          className={cn("flex min-w-0 flex-col gap-2", {
            "max-w-[85%] sm:max-w-[75%]": isUser,
            "w-full max-w-none": !isUser,
          })}
        >
          {message.parts.map((part, idx) => {
            if (part.type === "reasoning") {
              return (
                <Reasoning
                  key={idx}
                  text={part.text}
                  isStreaming={isLoading && idx === message.parts.length - 1}
                />
              );
            }
            if (part.type === "text") {
              return (
                <div
                  key={idx}
                  className={cn({
                    "bg-primary text-primary-foreground max-w-full rounded-[1.25rem] rounded-br-md px-3.5 py-2 break-all":
                      isUser,
                    "bg-transparent px-0 py-0 text-left": !isUser,
                  })}
                >
                  {isUser ? (
                    <div className="text-base leading-relaxed whitespace-pre-wrap">
                      {part.text}
                    </div>
                  ) : (
                    <Markdown>{part.text}</Markdown>
                  )}
                </div>
              );
            }
            return null;
          })}

          {isLoading && !isUser && <ThinkingIndicator />}

          {!isUser && (
            <MessageActions message={message} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}
