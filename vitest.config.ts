/// <reference types="vitest/config" />

import { defineConfig } from "vite";

export default defineConfig({
  test: {
    dir: "test",
    environment: "jsdom",
    setupFiles: ["./test/vitest.setup.ts"],
    coverage: {
      enabled: true,
      thresholds: { "100": true },
      include: ["src/**/**.{ts,tsx}"],
      exclude: ["src/**/index.ts", "src/types.ts", "src/**/**.d.ts"],
    },
  },
});
