import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { v4 as uuidv4 } from "uuid";

import { useTheme } from "~/lib";
import { Chat } from "~/components/chat/Chat";
import { ChatHeader } from "~/components/chat/ChatHeader";

export default function NewChatScreen() {
  const { colors } = useTheme();
  const conversationId = useMemo(() => uuidv4(), []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Chat conversationId={conversationId} initialMessages={[]} />
      <ChatHeader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
