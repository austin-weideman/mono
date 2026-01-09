import { useEffect, useMemo } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme, spacing, sizing, layout } from "~/lib";

function SkeletonBar({ width, delay }: { width: `${number}%`; delay: number }) {
  const { colors } = useTheme();
  const opacity = useMemo(() => new Animated.Value(0.3), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, delay]);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          width,
          backgroundColor: colors.surfaceMuted,
          opacity,
        },
      ]}
    />
  );
}

function SkeletonMessage({ isUser, lines }: { isUser: boolean; lines: number[] }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.surfaceMuted }]} />
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: colors.surfaceMuted }]
            : styles.bubbleAssistant,
        ]}
      >
        {lines.map((width, index) => (
          <SkeletonBar key={index} width={`${width}%`} delay={index * 100} />
        ))}
      </View>
    </View>
  );
}

export function ChatSkeleton() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + layout.headerClearance }]}>
      <View style={styles.messages}>
        <SkeletonMessage isUser={true} lines={[80]} />
        <SkeletonMessage isUser={false} lines={[90, 75, 60]} />
        <SkeletonMessage isUser={true} lines={[65]} />
        <SkeletonMessage isUser={false} lines={[85, 70]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  messages: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowAssistant: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: sizing.avatarSm,
    height: sizing.avatarSm,
    borderRadius: sizing.avatarSm / 2,
    marginRight: spacing.sm,
  },
  bubble: {
    maxWidth: "85%",
    gap: spacing.sm,
  },
  bubbleUser: {
    minWidth: 180,
    borderRadius: sizing.radiusLg,
    borderBottomRightRadius: spacing.xs,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
  },
  bubbleAssistant: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  bar: {
    height: 14,
    borderRadius: 7,
  },
});
