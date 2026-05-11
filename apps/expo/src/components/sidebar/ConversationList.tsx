import type { SectionListData } from "react-native";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type { Conversation } from "@mono/conversation";
import { groupConversationsByDate } from "@mono/chat-utils";

import { useTheme } from "~/lib";
import { trpc } from "~/utils/api";
import { ConversationItem } from "./ConversationItem";
import { ConversationListEmpty } from "./ConversationListEmpty";
import { ConversationListSkeleton } from "./ConversationListSkeleton";

const PAGE_SIZE = 50;
const ON_END_REACHED_THRESHOLD = 0.5;

interface ConversationSection {
  title: string;
  data: Conversation[];
}

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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(
      trpc.conversation.list.infiniteQueryOptions(
        { limit: PAGE_SIZE },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
      ),
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
    }),
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate({ conversationId: id });
    },
    [deleteMutation],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allConversations = useMemo(
    () => data?.pages.flatMap((page) => page.conversations) ?? [],
    [data?.pages],
  );

  const sections = useMemo((): ConversationSection[] => {
    if (allConversations.length === 0) return [];

    const grouped = groupConversationsByDate(allConversations);

    const sectionDefinitions: { title: string; data: Conversation[] }[] = [
      { title: "Today", data: grouped.today },
      { title: "Yesterday", data: grouped.yesterday },
      { title: "Last 7 days", data: grouped.lastWeek },
      { title: "Last 30 days", data: grouped.lastMonth },
      { title: "Older", data: grouped.older },
    ];

    return sectionDefinitions.filter((section) => section.data.length > 0);
  }, [allConversations]);

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem
        conversation={item}
        isActive={item.id === activeId}
        onDelete={handleDelete}
        onNavigate={onNavigate}
      />
    ),
    [activeId, handleDelete, onNavigate],
  );

  const renderSectionHeader = useCallback(
    ({
      section,
    }: {
      section: SectionListData<Conversation, ConversationSection>;
    }) => (
      <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
        {section.title}
      </Text>
    ),
    [colors.textMuted],
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={colors.textMuted} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading more...
          </Text>
        </View>
      );
    }

    if (!hasNextPage && allConversations.length > PAGE_SIZE) {
      return (
        <Text style={[styles.endText, { color: colors.textMuted }]}>
          You've reached the end of your chat history.
        </Text>
      );
    }

    return null;
  }, [
    isFetchingNextPage,
    hasNextPage,
    allConversations.length,
    colors.textMuted,
  ]);

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  if (allConversations.length === 0) {
    return <ConversationListEmpty />;
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      ListFooterComponent={renderFooter}
      style={styles.container}
      contentContainerStyle={styles.content}
      stickySectionHeadersEnabled={false}
      onEndReached={handleEndReached}
      onEndReachedThreshold={ON_END_REACHED_THRESHOLD}
      showsVerticalScrollIndicator={false}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 8,
  },
  sectionHeader: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 4,
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
