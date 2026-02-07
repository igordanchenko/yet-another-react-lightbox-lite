import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent } from "@testing-library/react";
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

vi.stubGlobal("resizeTo", (width: number, height: number) => {
  act(() => {
    window.innerWidth = width;
    window.innerHeight = height;

    fireEvent(window, new Event("resize"));
  });
});

vi.stubGlobal(
  "ResizeObserver",
  class {
    readonly callback: ResizeObserverCallback;
    readonly listener: () => void;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
      this.listener = () => {
        act(() => {
          this.callback([], this);
        });
      };

      window.addEventListener("resize", this.listener);
    }

    observe() {
      this.callback([], this);
    }

    unobserve() {}

    disconnect() {
      window.removeEventListener("resize", this.listener);
    }
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
