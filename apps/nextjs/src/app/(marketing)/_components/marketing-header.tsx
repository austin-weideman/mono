"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { cn } from "@microlearn/ui";

import { NAV_LINKS, SITE } from "../_lib/content";
import { CloseIcon, MenuIcon } from "./icons";
import { ScrollLink } from "./scroll-link";

interface MarketingHeaderProps {
  signInButton: React.ReactNode;
  signUpButton: React.ReactNode;
}

export function MarketingHeader({
  signInButton,
  signUpButton,
}: MarketingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "bg-eggshell fixed top-0 right-0 left-0 z-50 transition-[border-color,box-shadow]",
        scrolled ? "border-chalk border-b" : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="text-obsidian flex items-center gap-2 text-[15px] font-medium tracking-tight"
          >
            <Logomark />
            <span>{SITE.name}</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <ScrollLink
                key={link.label}
                href={link.href}
                className="text-gravel hover:text-obsidian text-sm font-normal transition-colors"
              >
                {link.label}
              </ScrollLink>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {signInButton}
          {signUpButton}
        </div>

        <button
          type="button"
          className="text-obsidian -mr-2 p-2 md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <CloseIcon className="size-5" />
          ) : (
            <MenuIcon className="size-5" />
          )}
        </button>
      </nav>

      <div
        className={cn(
          "border-chalk overflow-hidden border-t transition-[max-height,opacity] duration-300 ease-out md:hidden",
          mobileMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 border-transparent opacity-0",
        )}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <ScrollLink
              key={link.label}
              href={link.href}
              className="text-obsidian py-2 text-sm font-normal"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </ScrollLink>
          ))}
          <div className="border-chalk mt-3 flex flex-col gap-2 border-t pt-4">
            {signInButton}
            {signUpButton}
          </div>
        </div>
      </div>
    </header>
  );
}

function Logomark() {
  return (
    <span
      aria-hidden="true"
      className="bg-obsidian inline-flex size-5 items-center justify-center rounded-full"
    >
      <span className="bg-eggshell size-1.5 rounded-full" />
    </span>
  );
}
