import type { UIMessage } from "ai";

import { AttachmentChip, cn, Markdown, SparklesIcon } from "@mono/ui";

import { MessageActions } from "./message-actions";
import { Reasoning } from "./reasoning";
import { ThinkingIndicator } from "./thinking-indicator";

interface MessageProps {
  message: UIMessage;
  isLoading?: boolean;
}

interface FileItem {
  url: string;
  filename: string;
  mediaType: string;
}

type RenderItem =
  | { kind: "reasoning"; text: string; isStreaming: boolean }
  | { kind: "text"; text: string }
  | { kind: "files"; files: FileItem[] };

function buildRenderItems(
  parts: UIMessage["parts"],
  isLoading: boolean,
): RenderItem[] {
  const items: RenderItem[] = [];
  parts.forEach((part, idx) => {
    const isLastPart = idx === parts.length - 1;
    if (part.type === "reasoning") {
      const last = items[items.length - 1];
      const streamingNow = isLoading && isLastPart;
      if (last?.kind === "reasoning") {
        last.text += "\n\n" + part.text;
        last.isStreaming = last.isStreaming || streamingNow;
      } else {
        items.push({
          kind: "reasoning",
          text: part.text,
          isStreaming: streamingNow,
        });
      }
    } else if (part.type === "text") {
      items.push({ kind: "text", text: part.text });
    } else if (part.type === "file") {
      const last = items[items.length - 1];
      const file: FileItem = {
        url: part.url,
        filename: part.filename ?? "Document",
        mediaType: part.mediaType,
      };
      if (last?.kind === "files") {
        last.files.push(file);
      } else {
        items.push({ kind: "files", files: [file] });
      }
    }
  });
  return items;
}

export function Message({ message, isLoading }: MessageProps) {
  const isUser = message.role === "user";
  const items = buildRenderItems(message.parts, !!isLoading);

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

        {/* min-w-0 lets the flex child shrink below its intrinsic content width;
            wrap-break-word on the bubble breaks long URLs/tokens that would otherwise overflow. */}
        <div
          className={cn("flex min-w-0 flex-col gap-2", {
            "max-w-[85%] sm:max-w-[75%]": isUser,
            "w-full max-w-none": !isUser,
          })}
        >
          {items.map((item, idx) => {
            if (item.kind === "reasoning") {
              return (
                <Reasoning
                  key={idx}
                  text={item.text}
                  isStreaming={item.isStreaming}
                />
              );
            }
            if (item.kind === "files") {
              return (
                <div
                  key={idx}
                  className={cn("flex flex-wrap gap-2", {
                    "justify-end": isUser,
                  })}
                >
                  {item.files.map((f, i) => (
                    <AttachmentChip
                      key={i}
                      filename={f.filename}
                      mediaType={f.mediaType}
                      state="ready"
                      onOpen={() =>
                        window.open(f.url, "_blank", "noopener,noreferrer")
                      }
                    />
                  ))}
                </div>
              );
            }
            return (
              <div
                key={idx}
                className={cn({
                  "bg-primary text-primary-foreground max-w-full rounded-[1.25rem] rounded-br-md px-3.5 py-2 wrap-break-word":
                    isUser,
                  "bg-transparent px-0 py-0 text-left": !isUser,
                })}
              >
                {isUser ? (
                  <div className="text-base leading-relaxed whitespace-pre-wrap">
                    {item.text}
                  </div>
                ) : (
                  <Markdown>{item.text}</Markdown>
                )}
              </div>
            );
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
