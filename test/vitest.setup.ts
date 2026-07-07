import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Testing Library only auto-configures the React act environment when the test
// runner exposes global beforeAll/afterAll (vitest globals are disabled here),
// so set the flag explicitly. Without it, an update that lands in React's
// async act-flush window (e.g., the Portal close timeout racing React's
// setImmediate flush task after `await act(...)`) intermittently triggers
// "The current testing environment is not configured to support act(...)".
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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
    configurable: true,
    get() {
      return isCarousel(this) || this instanceof HTMLHtmlElement ? window.innerWidth : 0;
    },
  },
  clientHeight: {
    get() {
      return isCarousel(this) ? window.innerHeight : 0;
    },
  },
});
