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
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },
      reporter: [
        ["text", { skipEmpty: true }],
        ["html", { skipEmpty: true }],
      ],
    },
    setupFiles: ["./test/vitest.setup.ts"],
  },
});
