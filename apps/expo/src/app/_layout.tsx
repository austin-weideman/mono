import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "~/utils/api";

import "../styles.css";

const COLORS = {
  light: {
    primary: "#007AFF",
    background: "#FFFFFF",
  },
  dark: {
    primary: "#0A84FF",
    background: "#000000",
  },
} as const;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? COLORS.dark : COLORS.light;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: "#FFFFFF",
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
      <StatusBar />
    </QueryClientProvider>
  );
}
