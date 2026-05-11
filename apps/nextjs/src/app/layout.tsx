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
      ? "https://billsentry.com"
      : "http://localhost:3000",
  ),
  title: "BillSentry",
  description:
    "AI-native legislative tracking for California government affairs firms. Every bill watched. Every client briefed.",
  openGraph: {
    title: "BillSentry",
    description:
      "AI-native legislative tracking for California government affairs firms. Every bill watched. Every client briefed.",
    url: "https://billsentry.com",
    siteName: "BillSentry",
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
