import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Plus, Sparkles } from "lucide-react-native";

import { useTheme } from "~/lib";
import { authClient } from "~/utils/auth";

export function DrawerContent(_props: DrawerContentComponentProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: session } = authClient.useSession();

  const handleNewChat = () => {
    router.push("/");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Sparkles size={24} color={colors.primary} />
          <Text style={[styles.logo, { color: colors.textPrimary }]}>
            MicroLearn
          </Text>
        </View>

        <Pressable
          onPress={handleNewChat}
          style={[styles.newChatButton, { backgroundColor: colors.primary }]}
        >
          <Plus size={20} color={colors.textOnPrimary} />
          <Text style={[styles.newChatText, { color: colors.textOnPrimary }]}>
            New Chat
          </Text>
        </Pressable>

        <View style={styles.conversationList}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Your conversations will appear here once you start chatting!
          </Text>
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {session?.user ? (
            <View style={styles.userRow}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {session.user.name}
              </Text>
              <Pressable onPress={() => authClient.signOut()}>
                <Text style={[styles.signOutText, { color: colors.textMuted }]}>
                  Sign Out
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() =>
                authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/",
                })
              }
              style={[styles.signInButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.signInText, { color: colors.textOnPrimary }]}>
                Sign In
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  logo: {
    fontSize: 20,
    fontWeight: "700",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  newChatText: {
    fontWeight: "600",
  },
  conversationList: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    paddingHorizontal: 8,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userName: {
    fontWeight: "500",
  },
  signOutText: {
    fontSize: 14,
  },
  signInButton: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  signInText: {
    textAlign: "center",
    fontWeight: "600",
  },
});
