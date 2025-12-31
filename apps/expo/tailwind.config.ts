import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Dark mode colors (matching Next.js dark theme)
        background: "#000000",
        foreground: "#ffffff",
        card: "#121212",
        "card-foreground": "#ffffff",
        primary: "#3b82f6", // hsl(211 100% 52%)
        "primary-foreground": "#ffffff",
        secondary: "#1c1c1c",
        "secondary-foreground": "#ffffff",
        muted: "#1c1c1c",
        "muted-foreground": "#8f8f8f",
        accent: "#1c1c1c",
        "accent-foreground": "#ffffff",
        destructive: "#dc2626",
        "destructive-foreground": "#ffffff",
        border: "#262626",
        input: "#262626",
        ring: "#3b82f6",
        sidebar: "#0d0d0d",
        "sidebar-foreground": "#ffffff",
        "sidebar-primary": "#3b82f6",
        "sidebar-primary-foreground": "#ffffff",
        "sidebar-accent": "#1c1c1c",
        "sidebar-accent-foreground": "#ffffff",
        "sidebar-border": "#262626",
      },
    },
  },
  plugins: [],
} satisfies Config;

