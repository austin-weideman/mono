import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { groupConversationsByDate } from "@microlearn/chat-utils";

import { useTheme } from "~/lib";
import { trpc } from "~/utils/api";
import { ConversationGroup } from "./ConversationGroup";
import { ConversationListEmpty } from "./ConversationListEmpty";
import { ConversationListSkeleton } from "./ConversationListSkeleton";

const PAGE_SIZE = 50;

interface ConversationListProps {
  onNavigate: () => void;
}

export function ConversationList({ onNavigate }: ConversationListProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const activeId = pathname.startsWith("/chat/")
    ? pathname.replace("/chat/", "")
    : undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery(
    trpc.conversation.list.infiniteQueryOptions(
      { limit: PAGE_SIZE },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  const deleteMutation = useMutation(
    trpc.conversation.delete.mutationOptions({
      onSuccess: (_data, variables) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.conversation.list.pathKey(),
        });

        if (variables.conversationId === activeId) {
          router.replace("/");
        }
      },
    })
  );

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ conversationId: id });
  };

  const handleScroll = (event: { nativeEvent: { layoutMeasurement: { height: number }; contentOffset: { y: number }; contentSize: { height: number } } }) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  const allConversations = data?.pages.flatMap((page) => page.conversations) ?? [];

  if (allConversations.length === 0) {
    return <ConversationListEmpty />;
  }

  const grouped = groupConversationsByDate(allConversations);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={400}
    >
      <View style={styles.groups}>
        <ConversationGroup
          title="Today"
          conversations={grouped.today}
          activeId={activeId}
          onDelete={handleDelete}
          onNavigate={onNavigate}
        />
        <ConversationGroup
          title="Yesterday"
          conversations={grouped.yesterday}
          activeId={activeId}
          onDelete={handleDelete}
          onNavigate={onNavigate}
        />
        <ConversationGroup
          title="Last 7 days"
          conversations={grouped.lastWeek}
          activeId={activeId}
          onDelete={handleDelete}
          onNavigate={onNavigate}
        />
        <ConversationGroup
          title="Last 30 days"
          conversations={grouped.lastMonth}
          activeId={activeId}
          onDelete={handleDelete}
          onNavigate={onNavigate}
        />
        <ConversationGroup
          title="Older"
          conversations={grouped.older}
          activeId={activeId}
          onDelete={handleDelete}
          onNavigate={onNavigate}
        />
      </View>

      {isFetchingNextPage && (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={colors.textMuted} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading more...
          </Text>
        </View>
      )}

      {!hasNextPage && allConversations.length > PAGE_SIZE && (
        <Text style={[styles.endText, { color: colors.textMuted }]}>
          You've reached the end of your chat history.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 8,
  },
  groups: {
    gap: 24,
  },
  loadingMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  endText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
});
