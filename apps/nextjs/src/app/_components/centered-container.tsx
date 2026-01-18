import type { ReactNode } from "react";

import { cn } from "@microlearn/ui";

interface CenteredContainerProps {
  children: ReactNode;
  className?: string;
}

export function CenteredContainer({
  children,
  className,
}: CenteredContainerProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center px-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
