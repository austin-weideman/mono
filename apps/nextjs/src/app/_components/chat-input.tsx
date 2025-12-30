"use client";

import { useState } from "react";

import { cn, SendIcon } from "@microlearn/ui";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input);
      setInput("");
    }
  };

  const hasContent = input.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full items-end gap-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        disabled={disabled}
        placeholder="Send a message..."
        className="min-h-[44px] max-h-[200px] w-full resize-none rounded-2xl border border-border bg-muted px-4 py-2.5 pr-12 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        rows={1}
      />
      <button
        type="submit"
        disabled={disabled || !hasContent}
        className={cn(
          "absolute right-2 bottom-1.5 flex size-8 items-center justify-center rounded-full transition-all",
          hasContent
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "bg-muted text-muted-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <SendIcon />
      </button>
    </form>
  );
}

