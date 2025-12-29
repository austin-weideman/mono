"use client";

import {
  ChevronUpIcon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
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

export function SidebarUserNav({ user }: SidebarUserNavProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-10 cursor-pointer bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <span className="truncate">{user.email}</span>
              <ChevronUpIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-popper-anchor-width]"
            side="top"
          >
            <form action={signOutAction}>
              <DropdownMenuItem asChild>
                <button className="w-full cursor-pointer" type="submit">
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
