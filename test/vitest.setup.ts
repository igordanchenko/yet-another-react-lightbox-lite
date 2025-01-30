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

function isCarousel(target: unknown) {
  return target instanceof Element && target.classList.contains("yarll__carousel");
}

Object.defineProperties(window.HTMLElement.prototype, {
  clientWidth: {
    get() {
      return isCarousel(this) ? window.innerWidth : 0;
    },
  },
  clientHeight: {
    get() {
      return isCarousel(this) ? window.innerHeight : 0;
    },
  },
});
