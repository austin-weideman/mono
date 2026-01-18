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
    <Collapsible className="border-border/50 bg-muted/30 mb-2 rounded-lg border">
      <CollapsibleTrigger className="group text-muted-foreground hover:text-foreground flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm">
        <ChevronRightIcon
          size={14}
          className="transition-transform group-data-[state=open]:rotate-90"
        />
        <span className="font-medium">
          {isStreaming ? "Thinking..." : "Thought process"}
        </span>
        {isStreaming && (
          <span className="bg-primary ml-1 inline-block size-2 animate-pulse rounded-full" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-border/50 border-t px-3 py-2">
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">
            {text}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
