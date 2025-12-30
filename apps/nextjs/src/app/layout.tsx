import type { Metadata, Viewport } from "next";

import { cn, ThemeProvider, ThemeToggle, Toaster } from "@microlearn/ui";

import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://microlearn.app"
      : "http://localhost:3000",
  ),
  title: "MicroLearn",
  description: "AI-powered microlearning. Learn anything, one conversation at a time.",
  openGraph: {
    title: "MicroLearn",
    description: "AI-powered microlearning. Learn anything, one conversation at a time.",
    url: "https://microlearn.app",
    siteName: "MicroLearn",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <Toaster position="top-center" />
          <TRPCReactProvider>{props.children}</TRPCReactProvider>
          <div className="absolute right-4 bottom-4">
            <ThemeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
