import type { ReactNode } from "react";

import { cn } from "@microlearn/ui";

type MaxWidth =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl";

const MAX_WIDTH_MAP: Record<MaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
};

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: MaxWidth;
}

export function Section({
  id,
  children,
  className,
  maxWidth = "6xl",
}: SectionProps) {
  return (
    // overflow-hidden prevents horizontal scrolling on mobile when decorative
    // elements (gradient blobs, etc.) extend beyond the viewport width
    <section
      id={id}
      className={cn("overflow-hidden px-4 py-20 md:px-8 md:py-32", className)}
    >
      <div className={cn("relative mx-auto", MAX_WIDTH_MAP[maxWidth])}>
        {children}
      </div>
    </section>
  );
}
