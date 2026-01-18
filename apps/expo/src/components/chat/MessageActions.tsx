import { Pressable, StyleSheet, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Copy } from "lucide-react-native";

import { spacing, useTheme } from "~/lib";

const ICON_SIZE = 16;
const ACTION_BUTTON_PADDING = 6;
const ACTION_BUTTON_RADIUS = 6;

interface MessageActionsProps {
  textContent: string;
  isLoading?: boolean;
}

export function MessageActions({
  textContent,
  isLoading,
}: MessageActionsProps) {
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
        hitSlop={spacing.sm}
      >
        <Copy size={ICON_SIZE} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionButton: {
    padding: ACTION_BUTTON_PADDING,
    borderRadius: ACTION_BUTTON_RADIUS,
  },
});
