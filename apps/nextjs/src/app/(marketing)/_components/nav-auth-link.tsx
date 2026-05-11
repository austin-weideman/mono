import Link from "next/link";

import { cn } from "@mono/ui";

interface NavAuthLinkProps {
  href: string;
  variant: "primary" | "ghost";
  children: React.ReactNode;
}

export function NavAuthLink({ href, variant, children }: NavAuthLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium",
        "h-9 px-4 text-[14px] leading-none",
        "transition-[transform,background-color,box-shadow,border-color] duration-150 ease-out will-change-transform",
        "hover:scale-[1.03] active:scale-[0.97]",
        variant === "primary" &&
          "bg-obsidian text-eggshell border-obsidian hover:bg-cinder border hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]",
        variant === "ghost" &&
          "bg-eggshell text-obsidian border-chalk hover:bg-powder border hover:shadow-[0_4px_12px_-6px_rgba(0,0,0,0.15)]",
      )}
    >
      {children}
    </Link>
  );
}
