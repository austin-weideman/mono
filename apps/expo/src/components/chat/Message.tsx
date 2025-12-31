import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { UIMessage } from "ai";
import Markdown from "react-native-markdown-display";
import { Sparkles } from "lucide-react-native";

import { useTheme } from "~/lib";

interface MessageProps {
  message: UIMessage;
  isLoading?: boolean;
}

export const Message = React.memo<MessageProps>(({ message, isLoading }) => {
  const { colors } = useTheme();
  const isUser = message.role === "user";

  const textContent = useMemo(
    () =>
      message.parts
        .filter(
          (part): part is { type: "text"; text: string } => part.type === "text"
        )
        .map((part) => part.text)
        .join(""),
    [message.parts]
  );

  const markdownStyles = useMemo(
    () =>
      StyleSheet.create({
        body: {
          color: colors.textPrimary,
          fontSize: 16,
          lineHeight: 24,
        },
        code_inline: {
          backgroundColor: colors.surfaceMuted,
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 4,
          fontFamily: "monospace",
          color: colors.textPrimary,
        },
        fence: {
          backgroundColor: colors.surfaceMuted,
          padding: 12,
          borderRadius: 8,
          fontFamily: "monospace",
          color: colors.textPrimary,
        },
        link: {
          color: colors.primary,
        },
        heading1: {
          color: colors.textPrimary,
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 8,
        },
        heading2: {
          color: colors.textPrimary,
          fontSize: 20,
          fontWeight: "600",
          marginBottom: 8,
        },
        heading3: {
          color: colors.textPrimary,
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 4,
        },
        paragraph: {
          marginBottom: 8,
        },
        list_item: {
          color: colors.textPrimary,
        },
      }),
    [colors]
  );

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View
          style={[styles.avatar, { backgroundColor: colors.surfaceMuted }]}
        >
          <Sparkles size={14} color={colors.textPrimary} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: colors.primary }]
            : styles.bubbleAssistant,
        ]}
      >
        {isUser ? (
          <Text style={[styles.userText, { color: colors.textOnPrimary }]}>
            {textContent}
          </Text>
        ) : (
          <Markdown style={markdownStyles}>{textContent}</Markdown>
        )}

        {isLoading && !isUser && textContent.length === 0 && (
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            ...
          </Text>
        )}
      </View>
    </View>
  );
});

Message.displayName = "Message";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowAssistant: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  bubble: {
    maxWidth: "85%",
  },
  bubbleUser: {
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bubbleAssistant: {
    flex: 1,
  },
  userText: {
    fontSize: 16,
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 16,
  },
});
