import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import { Send } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { useTheme, spacing, sizing, fontSize } from "~/lib";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const hasContent = input.trim().length > 0;
  const canSend = hasContent && !disabled;

  const handleSubmit = () => {
    if (canSend) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSubmit(input.trim());
      setInput("");
    }
  };

  return (
    <KeyboardGestureArea interpolator="ios">
      <View
        style={[
          styles.container,
          {
            paddingBottom: Math.max(insets.bottom, spacing.md),
            backgroundColor: colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message..."
            placeholderTextColor={colors.textMuted}
            multiline
            editable={!disabled}
            onSubmitEditing={handleSubmit}
            blurOnSubmit={false}
            style={[styles.input, { color: colors.textPrimary }]}
          />
        </View>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSend}
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend
                ? colors.buttonPrimary
                : colors.surfaceMuted,
            },
          ]}
        >
          <Send
            size={sizing.icon}
            color={canSend ? colors.textOnPrimary : colors.textMuted}
          />
        </Pressable>
      </View>
    </KeyboardGestureArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: sizing.radiusLg + sizing.radiusSm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
  },
  input: {
    fontSize: fontSize.lg,
    maxHeight: 128,
    minHeight: spacing.xl,
  },
  sendButton: {
    width: sizing.touchTarget - 4,
    height: sizing.touchTarget - 4,
    borderRadius: (sizing.touchTarget - 4) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
