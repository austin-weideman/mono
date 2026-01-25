import { cn } from "@microlearn/ui";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  dark?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  centered = true,
  className,
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-16", centered && "text-center", className)}>
      <h2
        className={cn(
          "font-display mb-4 text-3xl font-semibold tracking-tight md:text-5xl",
          dark ? "text-pearl" : "text-ink",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mx-auto max-w-2xl text-lg",
            dark ? "text-shell" : "text-ink-muted",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
