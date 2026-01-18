import type { ReactNode } from "react";

interface HeroProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function Hero({ icon, title, description }: HeroProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-primary/10 ring-primary/20 flex size-16 items-center justify-center rounded-2xl ring-1">
        {icon}
      </div>
      <h1 className="text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>
      <p className="text-muted-foreground max-w-xl text-lg md:text-xl">
        {description}
      </p>
    </div>
  );
}
