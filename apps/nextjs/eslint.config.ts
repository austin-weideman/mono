import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@mono/eslint-config/base";
import { nextjsConfig } from "@mono/eslint-config/nextjs";
import { reactConfig } from "@mono/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
