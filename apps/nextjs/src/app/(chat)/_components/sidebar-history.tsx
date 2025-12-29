"use client";

import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type { Conversation } from "@microlearn/conversation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  LoaderIcon,
  MoreHorizontalIcon,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  TrashIcon,
  useSidebar,
} from "@microlearn/ui";

import { useTRPC } from "~/trpc/react";

// Types
interface GroupedConversations {
  today: Conversation[];
  yesterday: Conversation[];
  lastWeek: Conversation[];
  lastMonth: Conversation[];
  older: Conversation[];
}

// Group conversations by date using updatedAt
function groupConversationsByDate(
  conversations: Conversation[]
): GroupedConversations {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return conversations.reduce(
    (groups, conversation) => {
      const date = new Date(conversation.updatedAt);

      if (isToday(date)) {
        groups.today.push(conversation);
      } else if (isYesterday(date)) {
        groups.yesterday.push(conversation);
      } else if (date > oneWeekAgo) {
        groups.lastWeek.push(conversation);
      } else if (date > oneMonthAgo) {
        groups.lastMonth.push(conversation);
      } else {
        groups.older.push(conversation);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedConversations
  );
}

// Loading skeleton
function SidebarHistorySkeleton() {
  return (
    <SidebarGroup>
      <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">Today</div>
      <SidebarGroupContent>
        <div className="flex flex-col">
          {[44, 32, 28, 64, 52].map((width) => (
            <div
              className="flex h-8 items-center gap-2 rounded-md px-2"
              key={width}
            >
              <div
                className="bg-sidebar-accent-foreground/10 h-4 flex-1 rounded-md"
                style={{ maxWidth: `${width}%` }}
              />
            </div>
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// Conversation group component
function ConversationGroup({
  title,
  conversations,
  activeId,
  onDelete,
  setOpenMobile,
}: {
  title: string;
  conversations: Conversation[];
  activeId: string | undefined;
  onDelete: (id: string) => void;
  setOpenMobile: (open: boolean) => void;
}) {
  if (conversations.length === 0) return null;

  return (
    <div>
      <div className="text-sidebar-foreground/50 px-2 py-1 text-xs">
        {title}
      </div>
      {conversations.map((conversation) => (
        <SidebarMenuItem key={conversation.id}>
          <SidebarMenuButton asChild isActive={conversation.id === activeId}>
            <Link
              href={`/chat/${conversation.id}`}
              onClick={() => setOpenMobile(false)}
            >
              <span>{conversation.title ?? "New Conversation"}</span>
            </Link>
          </SidebarMenuButton>

          <DropdownMenu modal>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction
                className="mr-0.5 cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                showOnHover={conversation.id !== activeId}
              >
                <MoreHorizontalIcon />
                <span className="sr-only">More</span>
              </SidebarMenuAction>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/15 focus:text-destructive cursor-pointer dark:text-red-500"
                onSelect={() => onDelete(conversation.id)}
              >
                <TrashIcon />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      ))}
    </div>
  );
}

export function SidebarHistory() {
  const { setOpenMobile } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const activeId = typeof params.id === "string" ? params.id : undefined;

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Infinite query for conversations using new tRPC API
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery(
    trpc.conversation.list.infiniteQueryOptions(
      { limit: 20 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  // Delete mutation using new tRPC API
  const deleteMutation = useMutation(
    trpc.conversation.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate the conversation list to refetch
        void queryClient.invalidateQueries({
          queryKey: trpc.conversation.list.queryKey(),
        });

        // If we deleted the active conversation, navigate away
        if (deleteId === activeId) {
          router.push("/chat");
        }
      },
    })
  );

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate({ conversationId: deleteId });
    setShowDeleteDialog(false);
  };

  const onDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  // Loading state
  if (isLoading) {
    return <SidebarHistorySkeleton />;
  }

  // Flatten all pages into single array
  const allConversations = data?.pages.flatMap((page) => page.conversations) ?? [];

  // Empty state
  if (allConversations.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
            Your conversations will appear here once you start chatting!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  // Group by date
  const grouped = groupConversationsByDate(allConversations);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <div className="flex flex-col gap-6">
              <ConversationGroup
                title="Today"
                conversations={grouped.today}
                activeId={activeId}
                onDelete={onDeleteClick}
                setOpenMobile={setOpenMobile}
              />
              <ConversationGroup
                title="Yesterday"
                conversations={grouped.yesterday}
                activeId={activeId}
                onDelete={onDeleteClick}
                setOpenMobile={setOpenMobile}
              />
              <ConversationGroup
                title="Last 7 days"
                conversations={grouped.lastWeek}
                activeId={activeId}
                onDelete={onDeleteClick}
                setOpenMobile={setOpenMobile}
              />
              <ConversationGroup
                title="Last 30 days"
                conversations={grouped.lastMonth}
                activeId={activeId}
                onDelete={onDeleteClick}
                setOpenMobile={setOpenMobile}
              />
              <ConversationGroup
                title="Older"
                conversations={grouped.older}
                activeId={activeId}
                onDelete={onDeleteClick}
                setOpenMobile={setOpenMobile}
              />
            </div>
          </SidebarMenu>

          {/* Infinite scroll trigger */}
          <motion.div
            onViewportEnter={() => {
              if (!isFetchingNextPage && hasNextPage) {
                void fetchNextPage();
              }
            }}
          />

          {/* Loading more indicator */}
          {hasNextPage ? (
            <div className="mt-8 flex flex-row items-center gap-2 p-2 text-zinc-500 dark:text-zinc-400">
              <div className="animate-spin">
                <LoaderIcon />
              </div>
              <div>Loading more...</div>
            </div>
          ) : allConversations.length > 20 ? (
            <div className="mt-8 flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
              You&apos;ve reached the end of your chat history.
            </div>
          ) : null}
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Delete confirmation dialog */}
      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

