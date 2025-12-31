import { useEffect } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";

import type { Message as DbMessage } from "@microlearn/conversation";
import { convertDbMessagesToUIMessages } from "@microlearn/chat-utils";

import { useTheme } from "~/lib";
import { getBaseUrl } from "~/utils/base-url";
import { authClient } from "~/utils/auth";
import { ChatInput } from "./ChatInput";
import { Messages } from "./Messages";

interface ChatProps {
  conversationId: string;
  initialMessages: DbMessage[];
}

export function Chat({ conversationId, initialMessages }: ChatProps) {
  const { colors } = useTheme();

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
