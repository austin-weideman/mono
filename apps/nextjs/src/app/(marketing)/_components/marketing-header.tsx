"use client";

import { useState } from "react";
import Link from "next/link";

import { cn } from "@microlearn/ui";

import { NAV_LINKS, SITE } from "../_lib/content";
import { CloseIcon, MenuIcon } from "./icons";
import { ScrollLink } from "./scroll-link";

interface MarketingHeaderProps {
  signInButton: React.ReactNode;
}

export function MarketingHeader({ signInButton }: MarketingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-50">
      <div className="bg-warm-cream/75 border-warm-tan/60 mx-4 mt-4 rounded-2xl border shadow-[0_20px_60px_rgba(58,24,40,0.12)] backdrop-blur-md md:mx-8">
        <nav className="flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-display text-warm-brown text-xl font-semibold tracking-tight"
          >
            {SITE.name}
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <ScrollLink
                key={link.label}
                href={link.href}
                className="text-warm-brown-light hover:text-warm-brown text-sm font-medium transition-colors"
              >
                {link.label}
              </ScrollLink>
            ))}
          </div>

          <div className="hidden md:block">{signInButton}</div>

          <button
            type="button"
            className="text-warm-brown p-2 md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <CloseIcon className="size-6" />
            ) : (
              <MenuIcon className="size-6" />
            )}
          </button>
        </nav>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out md:hidden",
            mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="border-warm-tan/40 flex flex-col gap-4 border-t px-6 py-4">
            {NAV_LINKS.map((link) => (
              <ScrollLink
                key={link.label}
                href={link.href}
                className="text-warm-brown-light hover:text-warm-brown text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </ScrollLink>
            ))}
            <div className="pt-2">{signInButton}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
