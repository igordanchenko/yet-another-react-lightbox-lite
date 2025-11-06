import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

declare global {
  interface Window {
    __TEST__: {
      scrollbarWidth: number;
    };
  }
}

vi.stubGlobal("__TEST__", { scrollbarWidth: 0 });

afterEach(() => {
  cleanup();
});

vi.stubGlobal(
  "ResizeObserver",
  class implements ResizeObserver {
    callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe() {
      this.callback([], this);
    }

    unobserve() {}

    disconnect() {}
  },
);

function isCarousel(target: unknown) {
  return target instanceof Element && target.classList.contains("yarll__carousel");
}

Object.defineProperties(HTMLElement.prototype, {
  clientWidth: {
    get() {
      return isCarousel(this) || this instanceof HTMLHtmlElement
        ? Math.max(window.innerWidth - window.__TEST__.scrollbarWidth, 0)
        : 0;
    },
  },
  clientHeight: {
    get() {
      return isCarousel(this) ? window.innerHeight : 0;
    },
  },
});
