import type { ReactNode } from "react";

import { cn } from "@mono/ui";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("px-6 py-20 md:py-28", className)}>
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </section>
  );
}
