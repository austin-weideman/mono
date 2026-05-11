"use client";

import Image from "next/image";
import Link from "next/link";

import { getInitials } from "@mono/chat-utils";
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SettingsIcon,
  SidebarMenu,
  SidebarMenuItem,
} from "@mono/ui";

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
  const initials = getInitials(user.name);

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
    <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-xs font-medium">
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
                "hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent",
              )}
            >
              <UserAvatar user={user} />
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="truncate text-sm font-medium">
                  {user.name}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-popper-anchor-width] rounded-lg"
            side="top"
            align="start"
          >
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="w-full cursor-pointer rounded-md"
              >
                <SettingsIcon className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={signOutAction}>
              <DropdownMenuItem asChild>
                <button
                  className="w-full cursor-pointer rounded-md"
                  type="submit"
                >
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
