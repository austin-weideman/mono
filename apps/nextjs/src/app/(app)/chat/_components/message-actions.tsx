"use client";

import type { UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  buttonVariants,
  CheckIcon,
  cn,
  CopyIcon,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@mono/ui";

interface MessageActionsProps {
  message: UIMessage;
  isLoading?: boolean;
}

const COPIED_RESET_MS = 1500;

const iconSwap = {
  initial: { scale: 0.5, rotate: -90, opacity: 0 },
  animate: { scale: 1, rotate: 0, opacity: 1 },
  exit: { scale: 0.5, rotate: 90, opacity: 0 },
  transition: { duration: 0.15, ease: "easeOut" as const },
};

export function MessageActions({ message, isLoading }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

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
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            type="button"
            onClick={handleCopy}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 700, damping: 20 }}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "text-muted-foreground hover:text-foreground relative size-7 cursor-pointer",
            )}
          >
            <AnimatePresence initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  {...iconSwap}
                  className="text-primary absolute inset-0 flex items-center justify-center"
                >
                  <CheckIcon size={14} />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  {...iconSwap}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <CopyIcon size={14} />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="sr-only">Copy message</span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
      </Tooltip>
    </div>
  );
}
