import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/test-setup.ts"],
    // DB-backed tests open a real Neon transaction; 5s default is flaky on
    // cold connections and slow CI runners.
    testTimeout: 15_000,
  },
});
