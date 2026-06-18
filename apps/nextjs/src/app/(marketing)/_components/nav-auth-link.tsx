import Link from "next/link";

import { cn } from "@mono/ui";

interface NavAuthLinkProps {
  href: string;
  variant: "primary" | "ghost";
  children: React.ReactNode;
}

// Nav auth actions in the instrumentation voice: Roboto Mono, uppercase,
// hairline geometry. Primary is a filled paper rectangle on the dark nav
// (opposite surface); ghost is an outlined hairline. Lime is never used here.
export function NavAuthLink({ href, variant, children }: NavAuthLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "font-roboto-mono inline-flex h-9 items-center justify-center rounded-lg px-4 text-[13px] tracking-[-0.02em] uppercase",
        "transition-[transform,border-color,background-color] duration-150 ease-out hover:scale-[1.03] active:scale-[0.97]",
        variant === "primary" && "bg-paper text-abyssal-ink",
        variant === "ghost" &&
          "border-graphite text-paper hover:border-lichen border",
      )}
    >
      {children}
    </Link>
  );
}
