"use client";

import {
  ChevronRightIcon,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@microlearn/ui";

interface ReasoningProps {
  text: string;
  isStreaming?: boolean;
}

export function Reasoning({ text, isStreaming }: ReasoningProps) {
  if (!text && !isStreaming) {
    return null;
  }

  return (
    <Collapsible className="-my-1">
      <CollapsibleTrigger
        className={cn(
          "group/reasoning inline-flex cursor-pointer items-center gap-1.5",
          "text-muted-foreground hover:text-foreground",
          "text-sm transition-colors duration-200",
          "focus-visible:outline-none",
        )}
      >
        <ChevronRightIcon
          size={12}
          className="transition-transform duration-200 ease-out group-data-[state=open]/reasoning:rotate-90"
        />
        {isStreaming ? (
          <span
            className={cn(
              "animate-shimmer-text bg-clip-text text-transparent",
              "bg-size-[200%_100%]",
              "bg-[linear-gradient(110deg,var(--muted-foreground)_40%,var(--foreground)_50%,var(--muted-foreground)_60%)]",
            )}
          >
            Thinking
          </span>
        ) : (
          <span>Reasoning</span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-border/70 mt-2 ml-[5px] border-l pl-3.5">
          <p className="text-muted-foreground text-[13px] leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
