import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  SIDEBAR_COOKIE_NAME,
  SidebarInset,
  SidebarProvider,
  ThemeToggle,
} from "@microlearn/ui";

import { getSession } from "~/auth/server";
import { AppSidebar } from "./_components/app-sidebar";
import { TimezoneSync } from "./_components/timezone-sync";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([getSession(), cookies()]);

  if (!session) {
    redirect("/");
  }

  const sidebarState = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value;
  const defaultOpen =
    sidebarState === undefined ? true : sidebarState === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <TimezoneSync />
      <AppSidebar user={session.user} />
      <SidebarInset className="h-svh overflow-hidden">{children}</SidebarInset>
      <div className="fixed right-4 bottom-4 z-50">
        <ThemeToggle />
      </div>
    </SidebarProvider>
  );
}
