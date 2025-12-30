import type { UIMessage } from "ai";

import { cn, Markdown, SparklesIcon } from "@microlearn/ui";

interface MessageProps {
  message: UIMessage;
  isLoading?: boolean;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div className="group/message w-full" data-role={message.role}>
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": isUser,
          "justify-start": !isUser,
        })}
      >
        {!isUser && (
          <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <SparklesIcon size={14} />
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]": isUser,
            "w-full": !isUser,
          })}
        >
          {message.parts.map((part, idx) => {
            if (part.type === "text") {
              return (
                <div
                  key={idx}
                  className={cn({
                    "w-fit wrap-break-word rounded-2xl bg-primary px-3 py-2 text-primary-foreground":
                      isUser,
                    "bg-transparent px-0 py-0 text-left": !isUser,
                  })}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{part.text}</div>
                  ) : (
                    <Markdown>{part.text}</Markdown>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

