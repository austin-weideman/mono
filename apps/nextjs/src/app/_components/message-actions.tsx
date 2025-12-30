"use client";

import type { UIMessage } from "ai";

import {
  Button,
  CopyIcon,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@microlearn/ui";

interface MessageActionsProps {
  message: UIMessage;
  isLoading?: boolean;
}

export function MessageActions({ message, isLoading }: MessageActionsProps) {
  if (isLoading || message.role === "user") {
    return null;
  }

  const textContent = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  const handleCopy = async () => {
    if (!textContent) {
      toast.error("Nothing to copy");
      return;
    }

    await navigator.clipboard.writeText(textContent);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            type="button"
          >
            <CopyIcon size={14} />
            <span className="sr-only">Copy message</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>
    </div>
  );
}

