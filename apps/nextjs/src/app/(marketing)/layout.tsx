import type { ReactNode } from "react";

import { MarketingFooter } from "./_components/marketing-footer";
import { MarketingHeader } from "./_components/marketing-header";
import { NavAuthLink } from "./_components/nav-auth-link";

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div
      className="bg-eggshell text-obsidian flex min-h-screen flex-col"
      style={{ fontFamily: "var(--font-body)" }}
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
      <main className="flex-1 pt-14">{children}</main>
      <MarketingFooter />
    </div>
  );
}
