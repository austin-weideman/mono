import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowDown, Sparkles } from "lucide-react-native";

import { fontSize, layout, sizing, spacing, useTheme } from "~/lib";
import { Message } from "./Message";

type ChatStatus = UseChatHelpers<UIMessage>["status"];

interface MessagesProps {
  messages: UIMessage[];
  status: ChatStatus;
}

function EmptyState() {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: `${colors.primary}20` },
        ]}
      >
        <Sparkles size={sizing.iconLg} color={colors.primary} />
      </View>
      <View style={styles.emptyTextContainer}>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          How can I help you?
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Ask me anything...
        </Text>
      </View>
    </View>
  );
}

export function Messages({ messages, status }: MessagesProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<UIMessage>>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const hasMessages = messages.length > 0;

  const scrollToEnd = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const prevMessageCount = useRef(messages.length);
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      messages.length > prevMessageCount.current &&
      lastMessage?.role === "user"
    ) {
      scrollToEnd();
    }
    prevMessageCount.current = messages.length;
  }, [messages, scrollToEnd]);

  const isAtBottomRef = useRef(isAtBottom);
  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);

  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidShow", () => {
      if (isAtBottomRef.current) {
        scrollToEnd();
      }
    });
    return () => subscription.remove();
  }, [scrollToEnd]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      setIsAtBottom(distanceFromBottom < 50);
    },
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: UIMessage; index: number }) => (
      <View style={styles.messageWrapper}>
        <Message
          message={item}
          isLoading={status === "streaming" && index === messages.length - 1}
        />
      </View>
    ),
    [status, messages.length],
  );

  const keyExtractor = useCallback((item: UIMessage) => item.id, []);

  const topPadding = hasMessages
    ? insets.top + layout.headerClearance
    : insets.top;

  const fadeHeight = insets.top + layout.headerClearance;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={EmptyState}
        style={[styles.list, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: topPadding, flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={100}
      />
      {hasMessages && (
        <LinearGradient
          colors={[colors.background, `${colors.background}00`]}
          style={[styles.fadeGradient, { height: fadeHeight }]}
          pointerEvents="none"
        />
      )}
      {hasMessages && !isAtBottom && (
        <Pressable
          onPress={scrollToEnd}
          style={({ pressed }) => [
            styles.scrollButton,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <ArrowDown size={20} color={colors.textPrimary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fadeGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  scrollButton: {
    position: "absolute",
    bottom: spacing.md,
    alignSelf: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl + spacing.lg,
  },
  emptyIconContainer: {
    width: sizing.avatarLg,
    height: sizing.avatarLg,
    borderRadius: sizing.avatarLg / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTextContainer: {
    alignItems: "center",
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacing.lg,
  },
  messageWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
