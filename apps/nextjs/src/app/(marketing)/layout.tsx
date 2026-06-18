import type { ReactNode } from "react";
import { Inter_Tight, Roboto_Mono } from "next/font/google";

import { cn } from "@mono/ui";

import { MarketingFooter } from "./_components/marketing-footer";
import { MarketingHeader } from "./_components/marketing-header";
import { NavAuthLink } from "./_components/nav-auth-link";

// Aspekta is proprietary; Inter Tight is the design system's named substitute.
// One weight only. Hierarchy comes from size and tracking, never weight.
const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-aspekta",
  weight: ["400", "500"],
});

// The instrumentation voice: nav, counters, tags, dates, button text.
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
  weight: ["400"],
});

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div
      className={cn(
        interTight.variable,
        robotoMono.variable,
        "bg-abyssal-ink text-paper font-aspekta flex min-h-screen flex-col tracking-[-0.011em] antialiased",
      )}
    >
      <MarketingHeader
        signInButton={
          <NavAuthLink href="/login" variant="ghost">
            Log in
          </NavAuthLink>
        }
        signUpButton={
          <NavAuthLink href="/signup" variant="primary">
            Sign up
          </NavAuthLink>
        }
      />
      <main className="flex-1 pt-16">{children}</main>
      <MarketingFooter />
    </div>
  );
}
