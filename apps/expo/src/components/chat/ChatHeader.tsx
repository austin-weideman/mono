import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Menu } from "lucide-react-native";

import { layout, sizing, spacing, useTheme } from "~/lib";

export function ChatHeader() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={({ pressed }) => [
        styles.menuButton,
        {
          top: insets.top + spacing.sm,
          backgroundColor: pressed
            ? colors.surfaceMuted
            : `${colors.surfaceMuted}80`,
        },
      ]}
      hitSlop={spacing.sm}
      accessibilityLabel="Open menu"
      accessibilityRole="button"
    >
      <Menu size={sizing.icon} color={colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    left: layout.screenPadding,
    zIndex: 10,
    width: sizing.touchTarget,
    height: sizing.touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: sizing.touchTarget / 2,
  },
});
