/* eslint-disable import/no-extraneous-dependencies */
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
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90,
      },
      reporter: [
        ["text", { skipEmpty: true }],
        ["html", { skipEmpty: true }],
      ],
    },
    setupFiles: ["./test/vitest.setup.ts"],
  },
});
