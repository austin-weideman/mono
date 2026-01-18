import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Sparkles, SquarePen } from "lucide-react-native";
import { v4 as uuidv4 } from "uuid";

import { ConversationList } from "~/components/sidebar/ConversationList";
import { SidebarUserNav } from "~/components/sidebar/SidebarUserNav";
import { useTheme } from "~/lib";

export function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const { colors } = useTheme();

  const handleNewChat = () => {
    navigation.closeDrawer();
    const newId = uuidv4();
    router.navigate({
      pathname: "/chat/[id]",
      params: { id: newId, new: "true" },
    });
  };

  const handleNavigate = () => {
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Sparkles size={24} color={colors.primary} />
            <Text style={[styles.logo, { color: colors.textPrimary }]}>
              MicroLearn
            </Text>
          </View>
          <Pressable
            onPress={handleNewChat}
            style={({ pressed }) => [
              styles.newChatButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityLabel="New chat"
            accessibilityRole="button"
          >
            <SquarePen size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.conversationList}>
          <ConversationList onNavigate={handleNavigate} />
        </View>

        <SidebarUserNav />
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
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    fontSize: 20,
    fontWeight: "700",
  },
  newChatButton: {
    padding: 8,
    borderRadius: 8,
  },
  conversationList: {
    flex: 1,
  },
});
