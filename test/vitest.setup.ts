/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

vi.stubGlobal(
  "ResizeObserver",
  vi.fn((callback) => ({
    observe: vi.fn(callback),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
);

Object.defineProperties(window.HTMLElement.prototype, {
  clientWidth: {
    get() {
      return ((this.className || "") as string).includes("yarll__carousel") ? window.innerWidth : 0;
    },
  },
  clientHeight: {
    get() {
      return ((this.className || "") as string).includes("yarll__carousel") ? window.innerHeight : 0;
    },
  },
});
