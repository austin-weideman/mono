import type { UIMessage } from "ai";
import { useEffect, useRef } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import { fetch as expoFetch } from "expo/fetch";
import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";

import type { Message as DbMessage } from "@mono/conversation";
import { convertDbMessagesToUIMessages } from "@mono/chat-utils";

import { useTheme } from "~/lib";
import { trpc } from "~/utils/api";
import { authClient } from "~/utils/auth";
import { getBaseUrl } from "~/utils/base-url";
import { ChatInput } from "./ChatInput";
import { Messages } from "./Messages";

interface ChatProps {
  conversationId: string;
  initialMessages: DbMessage[];
  isNew?: boolean;
}

export function Chat({ conversationId, initialMessages, isNew }: ChatProps) {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const hasInvalidated = useRef(false);

  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    id: conversationId,
    messages: convertDbMessagesToUIMessages(initialMessages),
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: `${getBaseUrl()}/api/chat`,
      headers: (): Record<string, string> => {
        const cookies = authClient.getCookie();
        return cookies ? { Cookie: cookies } : {};
      },
      prepareSendMessagesRequest: ({ messages: allMessages }) => ({
        body: {
          conversationId,
          message: allMessages.at(-1),
        },
      }),
    }),
  });

  useEffect(() => {
    if (error) {
      console.error("Chat error:", error);
      Alert.alert(
        "Error",
        error.message || "Something went wrong. Please try again.",
      );
    }
  }, [error]);

  useEffect(() => {
    if (isNew && messages.length > 0 && !hasInvalidated.current) {
      hasInvalidated.current = true;
      void queryClient.invalidateQueries({
        queryKey: trpc.conversation.list.pathKey(),
      });
    }
  }, [isNew, messages.length, queryClient]);

  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current !== "streaming" && status === "streaming") {
      const hapticCount = 15;
      const interval = 60;
      let count = 0;

      const hapticInterval = setInterval(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        count++;
        if (count >= hapticCount) {
          clearInterval(hapticInterval);
        }
      }, interval);

      return () => clearInterval(hapticInterval);
    }
    prevStatus.current = status;
  }, [status]);

  const handleSubmit = (text: string) => {
    void sendMessage({ text });
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.messagesContainer}>
        <Messages messages={messages} status={status} />
      </View>
      <ChatInput onSubmit={handleSubmit} disabled={status !== "ready"} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
});
