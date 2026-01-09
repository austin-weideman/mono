import { useEffect, useRef } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import type { Message as DbMessage } from "@microlearn/conversation";
import { convertDbMessagesToUIMessages } from "@microlearn/chat-utils";

import { useTheme } from "~/lib";
import { trpc } from "~/utils/api";
import { getBaseUrl } from "~/utils/base-url";
import { authClient } from "~/utils/auth";
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
        if (cookies) {
          return { Cookie: cookies };
        }
        return {};
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
        error.message || "Something went wrong. Please try again."
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
