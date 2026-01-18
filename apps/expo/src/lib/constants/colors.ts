/**
 * Color palette for MicroLearn.
 * Follows semantic naming conventions for consistency.
 * Matches the Next.js app's theme.css for cross-platform consistency.
 */

const light = {
  // Surfaces
  background: "#ffffff",
  surfacePrimary: "#ffffff",
  surfaceSecondary: "#f7f8fa",
  surfaceMuted: "#f1f5f9",
  surfaceElevated: "#ffffff",

  // Borders
  border: "#e4e7ea",
  borderLight: "#ebecef",
  borderDark: "#cbced1",

  // Text
  textPrimary: "#1f2329",
  textSecondary: "#6c727a",
  textMuted: "#9ea2a8",
  textInverse: "#ffffff",
  textOnPrimary: "#ffffff", // Always white on primary color

  // Brand - matches Next.js hsl(211 100% 52%)
  primary: "#0a84ff",
  primaryLight: "#dbeafe",
  primaryDark: "#0066cc",

  // Status
  success: "#22c55e",
  successLight: "#dcfce7",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  info: "#0a84ff",
  infoLight: "#dbeafe",

  // Interactive
  buttonPrimary: "#0a84ff",
  buttonPrimaryPressed: "#0066cc",
  buttonPrimaryDisabled: "#93c5fd",
  buttonSecondary: "#e4e7ea",
  buttonSecondaryPressed: "#d1d5db",

  // Specific
  inputBackground: "#ffffff",
  inputBorder: "#e4e7ea",
  cardBackground: "#ffffff",
  overlay: "rgba(0, 0, 0, 0.5)",
};

const dark = {
  // Surfaces
  background: "#000000",
  surfacePrimary: "#000000",
  surfaceSecondary: "#0d0d0d",
  surfaceMuted: "#1c1c1c",
  surfaceElevated: "#121212",

  // Borders
  border: "#262626",
  borderLight: "#1c1c1c",
  borderDark: "#404040",

  // Text
  textPrimary: "#ffffff",
  textSecondary: "#a1a1aa",
  textMuted: "#71717a",
  textInverse: "#000000",
  textOnPrimary: "#ffffff", // Always white on primary color

  // Brand - matches Next.js hsl(211 100% 52%)
  primary: "#0a84ff",
  primaryLight: "#1e3a5f",
  primaryDark: "#3399ff",

  // Status
  success: "#22c55e",
  successLight: "#14532d",
  warning: "#f59e0b",
  warningLight: "#451a03",
  danger: "#ef4444",
  dangerLight: "#450a0a",
  info: "#0a84ff",
  infoLight: "#1e3a5f",

  // Interactive
  buttonPrimary: "#0a84ff",
  buttonPrimaryPressed: "#0066cc",
  buttonPrimaryDisabled: "#1e40af",
  buttonSecondary: "#27272a",
  buttonSecondaryPressed: "#3f3f46",

  // Specific
  inputBackground: "#121212",
  inputBorder: "#262626",
  cardBackground: "#121212",
  overlay: "rgba(0, 0, 0, 0.8)",
};

export const colors = {
  light,
  dark,
} as const;

export type TTheme = keyof typeof colors;
export type TColors = (typeof colors)[TTheme];
