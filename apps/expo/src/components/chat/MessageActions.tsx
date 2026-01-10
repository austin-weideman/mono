import { Pressable, StyleSheet, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Copy } from "lucide-react-native";

import { useTheme } from "~/lib";

interface MessageActionsProps {
  textContent: string;
  isLoading?: boolean;
}

export function MessageActions({ textContent, isLoading }: MessageActionsProps) {
  const { colors } = useTheme();

  if (isLoading || !textContent) {
    return null;
  }

  const handleCopy = async () => {
    await Clipboard.setStringAsync(textContent);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleCopy}
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: pressed ? colors.surfaceMuted : "transparent" },
        ]}
        hitSlop={8}
      >
        <Copy size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
  },
});
