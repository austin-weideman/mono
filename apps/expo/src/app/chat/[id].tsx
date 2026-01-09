import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "~/lib";
import { trpc } from "~/utils/api";
import { Chat } from "~/components/chat/Chat";
import { ChatHeader } from "~/components/chat/ChatHeader";

export default function ChatScreen() {
  const { colors } = useTheme();
  const { id, new: isNew } = useLocalSearchParams<{ id: string; new?: string }>();

  const { data, isLoading, error } = useQuery({
    ...trpc.conversation.load.queryOptions({ conversationId: id }),
    enabled: isNew !== "true",
  });

  if (isNew === "true") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Chat key={id} conversationId={id} initialMessages={[]} isNew />
        <ChatHeader />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>
          Conversation not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Chat conversationId={data.conversation.id} initialMessages={data.messages} />
      <ChatHeader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
  },
});
