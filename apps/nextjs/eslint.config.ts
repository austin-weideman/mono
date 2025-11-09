import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@microlearn/eslint-config/base";
import { nextjsConfig } from "@microlearn/eslint-config/nextjs";
import { reactConfig } from "@microlearn/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
