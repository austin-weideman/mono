"use client";

import Image from "next/image";

import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuItem,
} from "@microlearn/ui";

import { signOutAction } from "~/auth/actions";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface SidebarUserNavProps {
  user: User;
}

function UserAvatar({ user }: { user: User }) {
  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  if (user.image) {
    return (
      <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
        <Image
          src={user.image}
          alt={user.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
      {initials}
    </div>
  );
}

export function SidebarUserNav({ user }: SidebarUserNavProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="User menu"
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors",
                "hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent"
              )}
            >
              <UserAvatar user={user} />
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-popper-anchor-width] rounded-lg"
            side="top"
            align="start"
          >
            <form action={signOutAction}>
              <DropdownMenuItem asChild>
                <button className="w-full cursor-pointer rounded-md" type="submit">
                  Sign out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
