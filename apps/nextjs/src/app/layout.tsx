import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";

import { cn, ThemeProvider, Toaster } from "@mono/ui";

import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/styles.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["300", "400", "500"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://microlearn.app"
      : "http://localhost:3000",
  ),
  title: "MicroLearn",
  description:
    "AI-powered microlearning. Learn anything, one conversation at a time.",
  openGraph: {
    title: "MicroLearn",
    description:
      "AI-powered microlearning. Learn anything, one conversation at a time.",
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
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(fraunces.variable, inter.variable)}
    >
      <body
        className={cn(
          "bg-background text-foreground min-h-screen overflow-x-hidden font-sans antialiased",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
          enableSystem
        >
          <Toaster position="top-center" />
          <TRPCReactProvider>{props.children}</TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
