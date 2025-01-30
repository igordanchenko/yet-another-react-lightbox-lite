/// <reference types="vitest" />

import { defineConfig } from "vite";

export default defineConfig({
  test: {
    dir: "test",
    environment: "jsdom",
    coverage: {
      all: true,
      enabled: true,
      include: ["src"],
      thresholds: { "100": true },
      reporter: [
        ["text", { skipEmpty: true }],
        ["html", { skipEmpty: true }],
      ],
    },
    setupFiles: ["./test/vitest.setup.ts"],
  },
});
