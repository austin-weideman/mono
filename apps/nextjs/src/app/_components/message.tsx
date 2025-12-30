import type { UIMessage } from "ai";

import { cn, Markdown, SparklesIcon } from "@microlearn/ui";

import { MessageActions } from "./message-actions";
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
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
            <SparklesIcon size={14} />
          </div>
        )}

        <div
          className={cn("flex flex-col gap-2", {
            "max-w-[85%] sm:max-w-[75%]": isUser,
            "w-full max-w-none": !isUser,
          })}
        >
          {message.parts.map((part, idx) => {
            if (part.type === "text") {
              return (
                <div
                  key={idx}
                  className={cn({
                    "w-fit wrap-break-word bg-primary px-3.5 py-2 text-primary-foreground rounded-[1.25rem] rounded-br-md":
                      isUser,
                    "bg-transparent px-0 py-0 text-left": !isUser,
                  })}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap text-base leading-relaxed">{part.text}</div>
                  ) : (
                    <Markdown>{part.text}</Markdown>
                  )}
                </div>
              );
            }
            return null;
          })}

          {isLoading && !isUser && <ThinkingIndicator />}

          {!isUser && <MessageActions message={message} isLoading={isLoading} />}
        </div>
      </div>
    </div>
  );
}

