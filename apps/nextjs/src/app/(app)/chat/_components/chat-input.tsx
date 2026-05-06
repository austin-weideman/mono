"use client";

import { useState } from "react";

import { AutoResizeTextarea, cn, SendIcon } from "@microlearn/ui";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input);
      setInput("");
    }
  };

  const hasContent = input.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full items-end gap-2"
    >
      <AutoResizeTextarea
        value={input}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setInput(e.target.value)
        }
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        disabled={disabled}
        placeholder="Message"
        maxHeight={200}
        wrapperClassName="rounded-[1.25rem] border border-border bg-background transition-colors focus-within:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        className="placeholder:text-muted-foreground px-4 py-2.5 pr-12 text-base"
      />
      <button
        type="submit"
        disabled={disabled || !hasContent}
        aria-label="Send message"
        className={cn(
          "absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full transition-all",
          hasContent
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "text-muted-foreground bg-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <SendIcon />
      </button>
    </form>
  );
}
