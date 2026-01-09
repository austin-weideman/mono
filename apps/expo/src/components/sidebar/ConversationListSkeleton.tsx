import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "~/lib";

const SKELETON_WIDTHS = [44, 32, 28, 64, 52];

export function ConversationListSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Today
      </Text>
      <View style={styles.skeletonList}>
        {SKELETON_WIDTHS.map((widthPercent, index) => (
          <View key={index} style={styles.skeletonRow}>
            <View
              style={[
                styles.skeletonBar,
                {
                  width: `${widthPercent}%`,
                  backgroundColor: colors.surfaceMuted,
                },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skeletonList: {
    gap: 4,
  },
  skeletonRow: {
    height: 32,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  skeletonBar: {
    height: 16,
    borderRadius: 6,
  },
});
