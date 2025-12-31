import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

import type { TColors, TTheme } from "./constants/colors";
import { colors } from "./constants/colors";

interface ThemeContextValue {
  theme: TTheme;
  colors: TColors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  forcedTheme?: TTheme;
}

/**
 * Provides theme context to the app.
 * By default, follows system color scheme.
 * Can be overridden with forcedTheme prop.
 */
export function ThemeProvider({ children, forcedTheme }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();

  const value = useMemo<ThemeContextValue>(() => {
    const theme = forcedTheme ?? (systemColorScheme === "light" ? "light" : "dark");
    return {
      theme,
      colors: colors[theme],
    };
  }, [forcedTheme, systemColorScheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme and colors.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { ThemeContext };

