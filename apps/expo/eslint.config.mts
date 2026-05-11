import { defineConfig } from "eslint/config";

import { baseConfig } from "@mono/eslint-config/base";
import { reactConfig } from "@mono/eslint-config/react";

export default defineConfig(
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  baseConfig,
  reactConfig,
);
