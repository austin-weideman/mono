import { StyleSheet, Text, View } from "react-native";

import type { Conversation } from "@microlearn/conversation";

import { useTheme } from "~/lib";
import { ConversationItem } from "./ConversationItem";

interface ConversationGroupProps {
  title: string;
  conversations: Conversation[];
  activeId: string | undefined;
  onDelete: (id: string) => void;
  onNavigate: () => void;
}

export function ConversationGroup({
  title,
  conversations,
  activeId,
  onDelete,
  onNavigate,
}: ConversationGroupProps) {
  const { colors } = useTheme();

  if (conversations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {title}
      </Text>
      <View style={styles.list}>
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === activeId}
            onDelete={onDelete}
            onNavigate={onNavigate}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  list: {
    gap: 2,
  },
});
