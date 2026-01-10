"use client";

import {
  ChevronRightIcon,
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
    <Collapsible className="mb-2 rounded-lg border border-border/50 bg-muted/30">
      <CollapsibleTrigger className="group flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
        <ChevronRightIcon
          size={14}
          className="transition-transform group-data-[state=open]:rotate-90"
        />
        <span className="font-medium">
          {isStreaming ? "Thinking..." : "Thought process"}
        </span>
        {isStreaming && (
          <span className="ml-1 inline-block size-2 animate-pulse rounded-full bg-primary" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-border/50 px-3 py-2">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {text}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
