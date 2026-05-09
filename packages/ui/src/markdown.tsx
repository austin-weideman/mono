"use client";

import type { ComponentProps } from "react";
import { memo } from "react";
import { Streamdown } from "streamdown";

import { cn } from "./index";

type MarkdownProps = ComponentProps<typeof Streamdown>;

export const Markdown = memo(
  ({ className, ...props }: MarkdownProps) => (
    <Streamdown
      linkSafety={{ enabled: false }}
      className={cn(
        "size-full [&_code]:wrap-break-word [&_code]:whitespace-pre-wrap [&_ol]:list-outside [&_ol]:pl-6 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_ul]:list-outside [&_ul]:pl-6 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

Markdown.displayName = "Markdown";
