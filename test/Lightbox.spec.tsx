import { createContext, createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import {
  clickButtonClose,
  clickButtonNext,
  clickButtonPrev,
  expectCurrentSlideToBe,
  expectLightboxToBeClosed,
  getCurrentSlide,
  pointerSwipe,
  pointerZoom,
  querySelector,
  querySelectorAll,
  renderLightbox,
  slides,
  suppressConsoleErrors,
  wheelSwipe,
} from "./test-utils";
import { makeUseContext } from "../src/utils";

async function testNavigation(
  prev: () => void | Promise<void>,
  next: () => void | Promise<void>,
  close?: () => void | Promise<void>,
) {
  renderLightbox();
  expectCurrentSlideToBe(0);

  await prev();
  expectCurrentSlideToBe(0);

  await next();
  expectCurrentSlideToBe(1);

  await next();
  expectCurrentSlideToBe(2);

  await next();
  expectCurrentSlideToBe(2);

  await prev();
  expectCurrentSlideToBe(1);

  await (close || clickButtonClose)();
  await expectLightboxToBeClosed();
}

describe("Lightbox", () => {
  it("supports mouse navigation", async () => {
    await testNavigation(clickButtonPrev, clickButtonNext, clickButtonClose);
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();

    await testNavigation(
      () => user.keyboard("{ArrowLeft}"),
      () => user.keyboard("{ArrowRight}"),
      () => user.keyboard("{Esc}"),
    );
  });

  it("supports pointer navigation", async () => {
    const user = userEvent.setup();

    await testNavigation(
      () => pointerSwipe(user, getCurrentSlide(), 100, 0),
      () => pointerSwipe(user, getCurrentSlide(), -100, 0),
      () => user.pointer({ keys: "[TouchA]", target: getCurrentSlide() }),
    );
  });

  it("supports wheel navigation", async () => {
    vi.useFakeTimers();

    try {
      await testNavigation(
        () => wheelSwipe(-200, 0),
        () => wheelSwipe(200, 0),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("supports wheel cooldown", async () => {
    renderLightbox();

    wheelSwipe(200, 0, 0);
    wheelSwipe(200, 0, 800);

    expectCurrentSlideToBe(1);
  });

  it("supports closeOnPullUp", async () => {
    const user = userEvent.setup();

    renderLightbox();

    await pointerSwipe(user, getCurrentSlide(), 0, -100);
    await expectLightboxToBeClosed();
  });

  it("supports closeOnPullDown", async () => {
    const user = userEvent.setup();

    renderLightbox();

    await pointerSwipe(user, getCurrentSlide(), 0, 100);
    await expectLightboxToBeClosed();
  });

  it("supports closeOnBackdropClick", async () => {
    const user = userEvent.setup();

    renderLightbox();
    await user.click(querySelector(".yarll__portal")!);
    await expectLightboxToBeClosed();

    renderLightbox();
    await user.click(querySelector(".yarll__slide")!);
    await expectLightboxToBeClosed();
  });

  it("cancels multi-touch gestures", async () => {
    const user = userEvent.setup();

    renderLightbox();
    expectCurrentSlideToBe(0);

    await pointerZoom(user, getCurrentSlide());
    expectCurrentSlideToBe(0);
  });

  it("supports render functions", () => {
    renderLightbox({
      render: {
        slide: () => <span>custom slide</span>,
        slideHeader: () => <span>slide header</span>,
        slideFooter: () => <span>slide footer</span>,
        controls: () => <span>custom controls</span>,
        iconPrev: () => <span>icon prev</span>,
        iconNext: () => <span>icon next</span>,
        iconClose: () => <span>icon close</span>,
      },
    });

    expect(screen.getAllByText("custom slide").length).toBe(slides.length);
    expect(screen.getAllByText("slide header").length).toBe(slides.length);
    expect(screen.getAllByText("slide footer").length).toBe(slides.length);
    expect(screen.getAllByText("custom controls").length).toBe(1);
    expect(screen.getAllByText("icon prev").length).toBe(1);
    expect(screen.getAllByText("icon next").length).toBe(1);
    expect(screen.getAllByText("icon close").length).toBe(1);
  });

  it("supports custom labels", () => {
    const labels = { Previous: "_prev_", Next: "_next_", Close: "_close_" };

    renderLightbox({ labels });

    expect(screen.getByLabelText(labels.Previous)).toBeInTheDocument();
    expect(screen.getByLabelText(labels.Next)).toBeInTheDocument();
    expect(screen.getByLabelText(labels.Close)).toBeInTheDocument();
  });

  it("supports responsive images", () => {
    renderLightbox({
      slides: [
        { ...slides[0], srcSet: [{ src: "srcset", width: 800, height: 1200 }] },
        { ...slides[1], srcSet: [{ src: "srcset", width: 1200, height: 800 }] },
      ],
    });

    expect(querySelector('img[srcset="srcset 800w"]')).toBeInTheDocument();
    expect(querySelector('img[srcset="srcset 1200w"]')).toBeInTheDocument();
  });

  it("supports view transitions", () => {
    document.startViewTransition = (callback) => {
      callback();

      return {
        ready: Promise.resolve(),
        finished: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition() {},
      };
    };

    renderLightbox();
    expectCurrentSlideToBe(0);

    clickButtonNext();
    expectCurrentSlideToBe(1);

    // @ts-ignore
    document.startViewTransition = undefined;
  });

  it("supports custom styles", () => {
    renderLightbox({
      styles: {
        portal: { "--yarll__style": "portal" },
        carousel: { "--yarll__style": "carousel" },
        slide: { "--yarll__style": "slide" },
        toolbar: { "--yarll__style": "toolbarv" },
        button: { "--yarll__style": "button" },
        icon: { "--yarll__style": "icon" },
      },
    });

    expect(querySelector('div[style*="--yarll__style: portal"]')).toBeInTheDocument();
    expect(querySelector('div[style*="--yarll__style: carousel"]')).toBeInTheDocument();
    expect(querySelector('div[style*="--yarll__style: toolbar"]')).toBeInTheDocument();
    expect(querySelectorAll('div[style*="--yarll__style: slide"]').length).toBe(slides.length);
    expect(querySelectorAll('button[style*="--yarll__style: button"]').length).toBe(3);
    expect(querySelectorAll('svg[style*="--yarll__style: icon"]').length).toBe(3);
  });

  it("supports lightbox className", () => {
    renderLightbox({ className: "custom-class" });

    expect(querySelector(".yarll__portal.custom-class")).toBeInTheDocument();
  });

  it("supports custom toolbar buttons", () => {
    renderLightbox({
      toolbar: {
        buttons: [
          <button type="button" className="custom_toolbar_button1">
            Button 1
          </button>,
          <button key="button2" type="button" className="custom_toolbar_button2">
            Button 2
          </button>,
          "react node",
        ],
      },
    });

    expect(querySelector(".custom_toolbar_button1")).toBeInTheDocument();
    expect(querySelector(".custom_toolbar_button2")).toBeInTheDocument();
  });

  it("supports fixed toolbar position", () => {
    renderLightbox({ toolbar: { fixed: true } });

    expect(querySelector(".yarll__toolbar_fixed")).toBeInTheDocument();
  });

  it("respects portal siblings attributes", () => {
    const node = document.createElement("div");
    node.setAttribute("inert", "true");
    node.setAttribute("aria-hidden", "true");
    document.body.appendChild(node);

    renderLightbox().unmount();

    expect(node.getAttribute("inert")).toBe("true");
    expect(node.getAttribute("aria-hidden")).toBe("true");
  });

  it("supports proper context nesting", () => {
    suppressConsoleErrors(() =>
      expect(() => render(createElement(() => makeUseContext(createContext(null))()))).toThrowError(),
    );
  });

  it("ignores unsupported keyboard input", async () => {
    const user = userEvent.setup();

    renderLightbox();

    await user.keyboard("[Space][Enter]");

    expectCurrentSlideToBe(0);
  });
});