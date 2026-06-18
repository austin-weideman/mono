import Link from "next/link";

import { cn } from "@mono/ui";

// Shared primitives for the Autolab marketing site. The visual language is
// flat: hairline borders, single-weight Inter Tight display, Roboto Mono for
// technical labels, and one rationed lime signal that only ever fills a
// micro-surface (the 40x40 arrow square, the 6px tag dot, an active nav pill).

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// The only place lime fills a shape. A green traffic light pointing forward.
export function ArrowButton({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "bg-bioluminescent-lime text-abyssal-ink flex size-10 shrink-0 items-center justify-center rounded-lg",
        "transition-transform duration-150 ease-out hover:scale-[1.06] active:scale-[0.96]",
        className,
      )}
    >
      <ArrowIcon className="size-[18px]" />
    </Link>
  );
}

// Primary site CTA: a filled rectangle in the opposite surface color. On dark
// canvas it is paper-white; on light canvas it is abyssal ink. Never lime.
export function FilledButton({
  href,
  children,
  surface = "dark",
  className,
}: {
  href: string;
  children: React.ReactNode;
  surface?: "dark" | "light";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-roboto-mono inline-flex h-10 items-center justify-center rounded-lg px-4 text-[13px] tracking-[-0.02em] uppercase",
        "transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97]",
        surface === "dark"
          ? "bg-paper text-abyssal-ink"
          : "bg-abyssal-ink text-paper",
        className,
      )}
    >
      {children}
    </Link>
  );
}

// Low-emphasis CTA: transparent with a hairline border.
export function GhostButton({
  href,
  children,
  surface = "dark",
  className,
}: {
  href: string;
  children: React.ReactNode;
  surface?: "dark" | "light";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-roboto-mono inline-flex h-10 items-center justify-center rounded-lg border px-4 text-[13px] tracking-[-0.02em] uppercase",
        "transition-colors duration-150 ease-out",
        surface === "dark"
          ? "border-graphite text-paper hover:border-lichen"
          : "border-graphite/40 text-abyssal-ink hover:border-abyssal-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

// Section numbering marker, e.g. "01 / 04". The table-of-contents voice.
export function SectionCounter({
  index,
  total,
  surface = "dark",
}: {
  index: string;
  total: string;
  surface?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "font-roboto-mono inline-flex items-center rounded-full border px-3 py-1 text-[13px] tracking-[-0.02em]",
        surface === "dark"
          ? "border-graphite text-graphite"
          : "border-lichen text-graphite",
      )}
    >
      {index} / {total}
    </span>
  );
}

// The system's only color-coded classification marker: a 6px lime dot + mono
// uppercase label.
export function PubTag({
  children,
  surface = "dark",
  className,
}: {
  children: React.ReactNode;
  surface?: "dark" | "light";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-roboto-mono inline-flex items-center gap-2 text-[13px] tracking-[-0.02em] uppercase",
        surface === "dark" ? "text-lichen" : "text-graphite",
        className,
      )}
    >
      <span className="bg-bioluminescent-lime size-1.5 shrink-0 rounded-full" />
      {children}
    </span>
  );
}
