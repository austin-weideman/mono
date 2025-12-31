import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useTheme } from "~/lib";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  style,
  textStyle,
  ...props
}) => {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled) {
      return variant === "primary"
        ? colors.buttonPrimaryDisabled
        : colors.buttonSecondary;
    }
    switch (variant) {
      case "primary":
        return colors.buttonPrimary;
      case "secondary":
        return colors.buttonSecondary;
      case "ghost":
        return "transparent";
    }
  };

  const getTextColor = () => {
    if (isDisabled) {
      return variant === "primary" ? colors.textOnPrimary : colors.textMuted;
    }
    switch (variant) {
      case "primary":
        return colors.textOnPrimary;
      case "secondary":
      case "ghost":
        return colors.textPrimary;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "sm":
        return { paddingHorizontal: 12, paddingVertical: 8 };
      case "md":
        return { paddingHorizontal: 16, paddingVertical: 12 };
      case "lg":
        return { paddingHorizontal: 24, paddingVertical: 16 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm":
        return 14;
      case "md":
        return 16;
      case "lg":
        return 18;
    }
  };

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.container,
        getSizeStyles(),
        {
          backgroundColor: pressed && !isDisabled
            ? variant === "primary"
              ? colors.buttonPrimaryPressed
              : colors.buttonSecondaryPressed
            : getBackgroundColor(),
          opacity: isDisabled ? 0.7 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor(), fontSize: getFontSize() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Button;

