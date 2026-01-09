import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";

import type { Conversation } from "@microlearn/conversation";

import { useTheme } from "~/lib";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onDelete: (id: string) => void;
  onNavigate: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onDelete,
  onNavigate,
}: ConversationItemProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    onNavigate();
    router.navigate({
      pathname: "/chat/[id]",
      params: { id: conversation.id },
    });
  };

  const handleLongPress = () => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(conversation.id),
        },
      ]
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isActive
            ? colors.surfaceMuted
            : pressed
              ? colors.surfaceMuted
              : "transparent",
        },
      ]}
    >
      <Text
        style={[styles.title, { color: colors.textPrimary }]}
        numberOfLines={1}
      >
        {conversation.title ?? "New Conversation"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
  },
});
