import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import { getInitials } from "@microlearn/chat-utils";

import { useTheme, fontSize } from "~/lib";
import { authClient } from "~/utils/auth";

export function SidebarUserNav() {
  const { colors } = useTheme();
  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const initials = getInitials(user.name);

  const handleLongPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(user.email, undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => void authClient.signOut(),
      },
    ]);
  };

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      <Pressable
        onLongPress={handleLongPress}
        style={({ pressed }) => [
          styles.userInfo,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        {user.image ? (
          <Image source={{ uri: user.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
            <Text style={[styles.initials, { color: colors.textOnPrimary }]}>
              {initials}
            </Text>
          </View>
        )}
        <Text
          style={[styles.userName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {user.name}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 16,
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
  userName: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: "500",
  },
});
