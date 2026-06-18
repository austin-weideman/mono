import type { UIMessage } from "ai";

import { cn, Markdown, SparklesIcon } from "@mono/ui";

import { Reasoning } from "../../chat/_components/reasoning";
import { ThinkingIndicator } from "../../chat/_components/thinking-indicator";
import { ExperimentCard } from "./experiment-card";

const RUN_EXPERIMENT_PART_TYPE = "tool-run_experiment";

interface LabMessageProps {
  message: UIMessage;
  isLoading?: boolean;
  scrambled?: boolean;
}

// A loose view of a tool-call UIMessage part (AI SDK 6). Static tools surface as
// `tool-<name>`; we read input/output/state without depending on the generated
// per-tool union types.
interface ToolPartLike {
  type: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  toolName?: string;
}

type RenderItem =
  | { kind: "reasoning"; text: string; isStreaming: boolean }
  | { kind: "text"; text: string }
  | { kind: "tool"; input: unknown; output: unknown; isError: boolean };

function isRunExperimentPart(type: string, part: ToolPartLike): boolean {
  return (
    type === RUN_EXPERIMENT_PART_TYPE ||
    (type === "dynamic-tool" && part.toolName === "run_experiment")
  );
}

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
      return;
    }
    if (part.type === "text") {
      items.push({ kind: "text", text: part.text });
      return;
    }
    const toolPart = part as unknown as ToolPartLike;
    if (isRunExperimentPart(part.type, toolPart)) {
      items.push({
        kind: "tool",
        input: toolPart.input,
        output: toolPart.output,
        isError: toolPart.state === "output-error",
      });
    }
  });
  return items;
}

export function LabMessage({ message, isLoading, scrambled }: LabMessageProps) {
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
            if (item.kind === "tool") {
              return (
                <ExperimentCard
                  key={idx}
                  input={
                    item.input as
                      | {
                          params?: Record<string, string | number>;
                          predictedValue?: number;
                        }
                      | undefined
                  }
                  output={
                    item.output as
                      | {
                          ok?: boolean;
                          iteration?: number;
                          shownValue?: number;
                          predictedValue?: number;
                          remainingExperiments?: number;
                          errors?: string[];
                        }
                      | undefined
                  }
                  isError={item.isError}
                  scrambled={scrambled}
                />
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
        </div>
      </div>
    </div>
  );
}
