import type { UIMessage } from "ai";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";

import { fontSize, markdownParser, openLink, useTheme } from "~/lib";
import { MessageActions } from "./MessageActions";
import { Reasoning } from "./Reasoning";

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
          (part): part is { type: "text"; text: string } =>
            part.type === "text",
        )
        .map((part) => part.text)
        .join(""),
    [message.parts],
  );

  const markdownStyles = useMemo(
    () =>
      StyleSheet.create({
        body: {
          color: colors.textPrimary,
          fontSize: fontSize.lg,
          lineHeight: 26,
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
          textDecorationLine: "underline",
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
    [colors],
  );

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
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
          <>
            {message.parts.map((part, idx) => {
              if (part.type === "reasoning") {
                return (
                  <Reasoning
                    key={idx}
                    text={part.text}
                    isStreaming={isLoading && idx === message.parts.length - 1}
                  />
                );
              }
              if (part.type === "text") {
                return (
                  <Markdown
                    key={idx}
                    style={markdownStyles}
                    markdownit={markdownParser}
                    onLinkPress={openLink}
                  >
                    {part.text}
                  </Markdown>
                );
              }
              return null;
            })}
          </>
        )}

        {isLoading && !isUser && textContent.length === 0 && (
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            ...
          </Text>
        )}

        {!isUser && (
          <MessageActions textContent={textContent} isLoading={isLoading} />
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
  bubble: {},
  bubbleUser: {
    maxWidth: "85%",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bubbleAssistant: {
    flex: 1,
  },
  userText: {
    fontSize: fontSize.lg,
    lineHeight: 26,
  },
  loadingText: {
    fontSize: fontSize.lg,
  },
});
