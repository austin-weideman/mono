import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "~/lib";

export function ConversationListEmpty() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.textMuted }]}>
        Your conversations will appear here once you start chatting!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    textAlign: "center",
  },
});
