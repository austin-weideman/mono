import type { ReactNode } from "react";

interface HeroProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function Hero({ icon, title, description }: HeroProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        {icon}
      </div>
      <h1 className="font-bold text-4xl tracking-tight md:text-6xl">{title}</h1>
      <p className="max-w-xl text-muted-foreground text-lg md:text-xl">
        {description}
      </p>
    </div>
  );
}

