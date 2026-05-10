import { cn } from "@microlearn/ui";

import { Reveal } from "./animations";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  size?: "default" | "lg";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
  size = "default",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-14 max-w-[720px] md:mb-20",
        centered && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal as="p" className="text-gravel mb-3 text-sm font-normal">
          {eyebrow}
        </Reveal>
      )}
      <Reveal delay={eyebrow ? 0.08 : 0}>
        <h2
          className={cn(
            "font-display text-obsidian font-light",
            size === "default" &&
              "text-[32px] leading-[1.13] tracking-[-0.64px] md:text-[36px] md:tracking-[-0.72px]",
            size === "lg" &&
              "text-[36px] leading-[1.1] tracking-[-0.72px] md:text-[48px] md:leading-[1.08] md:tracking-[-0.96px]",
          )}
        >
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal as="p" delay={0.16}>
          <span
            className={cn(
              "text-gravel mt-4 block text-[16px] leading-[1.5]",
              centered && "mx-auto",
            )}
          >
            {subtitle}
          </span>
        </Reveal>
      )}
    </div>
  );
}
