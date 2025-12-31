import React from "react";
import { StyleSheet, type ViewProps } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "~/lib";

interface SafeAreaViewProps extends ViewProps {
  children: React.ReactNode;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

/**
 * Theme-aware SafeAreaView wrapper.
 * Automatically applies the correct background color based on theme.
 */
const SafeAreaView = React.memo<SafeAreaViewProps>(
  ({ style, children, edges, ...props }) => {
    const { colors } = useTheme();

    return (
      <RNSafeAreaView
        style={[styles.container, { backgroundColor: colors.background }, style]}
        edges={edges}
        {...props}
      >
        {children}
      </RNSafeAreaView>
    );
  }
);

SafeAreaView.displayName = "SafeAreaView";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaView;

