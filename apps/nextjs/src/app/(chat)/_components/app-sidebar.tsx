"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Button,
  PlusIcon,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useSidebar,
} from "@microlearn/ui";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface AppSidebarProps {
  user: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between">
            <Link
              className="flex flex-row items-center gap-3"
              href="/chat"
              onClick={() => {
                setOpenMobile(false);
              }}
            >
              <span className="hover:bg-muted cursor-pointer rounded-md px-2 text-lg font-semibold">
                MicroLearn
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-8 p-1 md:h-fit md:p-2"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push("/chat");
                    router.refresh();
                  }}
                  type="button"
                  variant="ghost"
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end" className="hidden md:block">
                New Chat
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <div className="text-muted-foreground p-4 text-sm">
          Conversations will appear here
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="text-muted-foreground p-2 text-sm">
          Signed in as {user.email}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

