import type { ReactNode } from "react";

import { GoogleSignInButton } from "./_components/google-sign-in-button";
import { MarketingFooter } from "./_components/marketing-footer";
import { MarketingHeader } from "./_components/marketing-header";

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
          <GoogleSignInButton variant="ghost">Log in</GoogleSignInButton>
        }
        signUpButton={
          <GoogleSignInButton variant="primary">Sign up</GoogleSignInButton>
        }
      />
      <main className="flex-1 pt-14">{children}</main>
      <MarketingFooter />
    </div>
  );
}
