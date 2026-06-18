"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { cn } from "@mono/ui";

import { NAV_LINKS, SITE } from "../_lib/content";
import { CloseIcon, MenuIcon } from "./icons";
import { Logomark } from "./logomark";
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
        "bg-abyssal-ink fixed top-0 right-0 left-0 z-50 transition-[border-color]",
        scrolled ? "border-graphite border-b" : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="text-paper group flex items-center gap-2.5 text-[17px] tracking-[-0.01em]"
          >
            <Logomark />
            <span>{SITE.name}</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <ScrollLink
                key={link.label}
                href={link.href}
                className="font-roboto-mono text-lichen hover:text-paper text-[13px] tracking-[-0.02em] uppercase transition-colors"
              >
                {link.label}
              </ScrollLink>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          {signInButton}
          {signUpButton}
        </div>

        <button
          type="button"
          className="text-paper -mr-2 p-2 md:hidden"
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
          "border-graphite overflow-hidden border-t transition-[max-height,opacity] duration-300 ease-out md:hidden",
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
              className="font-roboto-mono text-paper py-2 text-[13px] tracking-[-0.02em] uppercase"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </ScrollLink>
          ))}
          <div className="border-graphite mt-3 flex flex-col gap-2 border-t pt-4">
            {signInButton}
            {signUpButton}
          </div>
        </div>
      </div>
    </header>
  );
}
