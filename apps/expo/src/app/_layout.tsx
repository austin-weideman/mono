import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider, useTheme } from "~/lib";
import { queryClient } from "~/utils/api";
import { AuthGate } from "~/components/auth/AuthGate";
import { DrawerContent } from "~/components/navigation/DrawerContent";

import "../styles.css";

function AppContent() {
  const { theme, colors } = useTheme();

  return (
    <>
      <AuthGate>
        <Drawer
          drawerContent={(props: DrawerContentComponentProps) => (
            <DrawerContent {...props} />
          )}
          screenOptions={{
            headerShown: false,
            drawerType: "slide",
            swipeEnabled: true,
            drawerStyle: {
              backgroundColor: colors.surfaceSecondary,
            },
          }}
        />
      </AuthGate>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
