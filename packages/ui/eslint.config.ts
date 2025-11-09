import { defineConfig } from "eslint/config";

import { baseConfig } from "@microlearn/eslint-config/base";
import { reactConfig } from "@microlearn/eslint-config/react";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
