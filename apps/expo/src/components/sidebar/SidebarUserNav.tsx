import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { getInitials } from "@microlearn/chat-utils";

import { useTheme } from "~/lib";
import { authClient } from "~/utils/auth";

export function SidebarUserNav() {
  const { colors } = useTheme();
  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const initials = getInitials(user.name);

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      <View style={styles.userInfo}>
        {user.image ? (
          <Image source={{ uri: user.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
            <Text style={[styles.initials, { color: colors.textOnPrimary }]}>
              {initials}
            </Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text
            style={[styles.userName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {user.name}
          </Text>
          <Text
            style={[styles.userEmail, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {user.email}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={() => authClient.signOut()}
        style={({ pressed }) => [
          styles.signOutButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[styles.signOutText, { color: colors.textMuted }]}>
          Sign Out
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 12,
    fontWeight: "600",
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 14,
    fontWeight: "500",
  },
  userEmail: {
    fontSize: 12,
  },
  signOutButton: {
    alignSelf: "flex-start",
  },
  signOutText: {
    fontSize: 14,
  },
});
