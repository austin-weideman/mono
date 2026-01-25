import type { ReactNode } from "react";

import { GoogleSignInButton } from "./_components/google-sign-in-button";
import { MarketingFooter } from "./_components/marketing-footer";
import { MarketingHeader } from "./_components/marketing-header";

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader
        signInButton={
          <GoogleSignInButton variant="outline">Sign In</GoogleSignInButton>
        }
      />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
