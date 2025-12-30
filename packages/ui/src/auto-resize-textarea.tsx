"use client";

import { useCallback, useEffect, useRef } from "react";

import { cn } from "./utils";

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Maximum height before scrolling (default: 200px) */
  maxHeight?: number;
  /** Classes for the outer wrapper (borders, background, border-radius) */
  wrapperClassName?: string;
}

export function AutoResizeTextarea({
  className,
  wrapperClassName,
  maxHeight = 200,
  value,
  onChange,
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [maxHeight]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    adjustHeight();
  };

  return (
    <div
      className={cn("w-full overflow-hidden", wrapperClassName)}
      style={{ maxHeight: `${maxHeight}px` }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className={cn(
          // field-sizing: content makes textarea size to content (Chrome 123+)
          // leading-snug gives predictable line-height for vertical centering
          "size-full resize-none overflow-y-auto bg-transparent leading-snug transition-[height] duration-100 [field-sizing:content] focus:outline-none",
          className
        )}
        {...props}
      />
    </div>
  );
}

