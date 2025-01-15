import { createContext, createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import {
  clickButtonClose,
  clickButtonNext,
  clickButtonPrev,
  expectCurrentSlideToBe,
  expectLightboxToBeClosed,
  expectToBeZoomedIn,
  expectToBeZoomedOut,
  getCloseButton,
  getController,
  getCurrentSlide,
  getCurrentSlideImage,
  getNextButton,
  getPreviousButton,
  getSlidesCount,
  pointerSwipe,
  pointerZoom,
  querySelector,
  querySelectorAll,
  renderLightbox,
  slides,
  suppressConsoleErrors,
  wheelSwipe,
  wheelZoom,
  withFakeTimers,
} from "./test-utils";
import { useZoom } from "../src/components";
import { makeUseContext } from "../src/utils";

declare module "../src/types" {
  interface CustomSlide extends GenericSlide {
    type: "custom-slide";
  }

  // noinspection JSUnusedGlobalSymbols
  interface SlideTypes {
    "custom-slide": CustomSlide;
  }
}

async function testNavigation(
  prev: () => void | Promise<void>,
  next: () => void | Promise<void>,
  close?: () => void | Promise<void>,
) {
  renderLightbox();
  expectCurrentSlideToBe(0);

  await prev();
  expectCurrentSlideToBe(2);

  await next();
  expectCurrentSlideToBe(0);

  await next();
  expectCurrentSlideToBe(1);

  await next();
  expectCurrentSlideToBe(2);

  await next();
  expectCurrentSlideToBe(0);

  await prev();
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
      () => pointerSwipe(user, getCurrentSlide(), 150, 0),
      () => pointerSwipe(user, getCurrentSlide(), -150, 0),
      () => user.pointer({ keys: "[TouchA]", target: getCurrentSlide() }),
    );

    await testNavigation(
      () => user.pointer({ keys: "[MouseLeft>][/MouseLeft]", target: getPreviousButton() }),
      () => user.pointer({ keys: "[MouseLeft>][/MouseLeft]", target: getNextButton() }),
      () => user.pointer({ keys: "[MouseLeft>][/MouseLeft]", target: getCloseButton() }),
    );
  });

  it("supports wheel navigation", async () => {
    await withFakeTimers(async () => {
      await testNavigation(
        () => wheelSwipe(-200, 0),
        () => wheelSwipe(200, 0),
      );
    });
  });

  it("supports wheel cooldown", async () => {
    renderLightbox();

    await withFakeTimers(async () => {
      wheelSwipe(200, 0, 0);
      wheelSwipe(200, 0, 800);
    });

    expectCurrentSlideToBe(1);
  });

  it("supports closeOnPullUp", async () => {
    const user = userEvent.setup();

    renderLightbox();

    await pointerSwipe(user, getCurrentSlide(), 0, -120);
    await expectLightboxToBeClosed();
  });

  it("supports closeOnPullDown", async () => {
    const user = userEvent.setup();

    renderLightbox();

    await pointerSwipe(user, getCurrentSlide(), 0, 120);
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
    node.setAttribute("inert", "");
    node.setAttribute("aria-hidden", "true");
    document.body.appendChild(node);

    renderLightbox().unmount();

    expect(node.getAttribute("inert")).toBe("");
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

  it("supports wheel zoom", async () => {
    renderLightbox();

    wheelZoom(50, 0);
    expectCurrentSlideToBe(0);
    expectToBeZoomedOut();

    wheelZoom(0, -50);
    expectCurrentSlideToBe(0);
    expectToBeZoomedIn();

    await withFakeTimers(async () => {
      wheelSwipe(50, 0, 0);
    });

    expectCurrentSlideToBe(0);
    expectToBeZoomedIn();
  });

  it("supports keyboard zoom", async () => {
    const user = userEvent.setup();

    renderLightbox();

    await user.keyboard("+");
    expectToBeZoomedIn();

    await user.keyboard("{ArrowLeft}{ArrowRight}{ArrowUp}{ArrowDown}");
    expectCurrentSlideToBe(0);

    await user.keyboard("-");
    expectToBeZoomedOut();

    await user.keyboard("{Meta>}={/Meta}");
    expectToBeZoomedIn();

    await user.keyboard("{Meta>}_{/Meta}");
    expectToBeZoomedOut();

    await user.keyboard("+++");
    expectToBeZoomedIn();

    await user.keyboard("{Meta>}0{/Meta}");
    expectToBeZoomedOut();
  });

  it("supports pointer zoom", async () => {
    const user = userEvent.setup();

    renderLightbox();

    const target = getCurrentSlide();

    await user.pointer([
      { keys: "[TouchA>]", target, coords: { x: 100, y: 100 } },
      { keys: "[TouchB>]", target, coords: { x: 200, y: 200 } },
      { pointerName: "TouchA", target, coords: { x: 50, y: 50 } },
      { keys: "[/TouchA][/TouchB]", target },
    ]);
    expectToBeZoomedIn();

    await user.pointer([
      { keys: "[TouchA>]", target, coords: { x: 100, y: 100 } },
      { pointerName: "TouchA", target, coords: { x: 150, y: 150 } },
      { keys: "[/TouchA]", target },
    ]);
    expectToBeZoomedIn();

    await user.pointer([
      { keys: "[TouchA>]", target, coords: { x: 100, y: 100 } },
      { keys: "[TouchB>]", target, coords: { x: 200, y: 200 } },
      { pointerName: "TouchA", target, coords: { x: 150, y: 150 } },
      { keys: "[/TouchA][/TouchB]", target },
    ]);
    expectToBeZoomedOut();
  });

  it("supports double-click zoom", async () => {
    const user = userEvent.setup();

    renderLightbox();

    await user.dblClick(getController());
    expectToBeZoomedIn();

    for (let i = 0; i < 3; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await user.dblClick(getController());
    }
    expectToBeZoomedOut();
  });

  it("supports disabling zoom", async () => {
    const user = userEvent.setup();

    renderLightbox({ zoom: { disabled: true } });

    await user.dblClick(getController());
    expectToBeZoomedOut();
  });

  it("supports zoom on custom slides", () => {
    let maxZoom: number | undefined;

    const scenario = {
      slides: [{ type: "custom-slide" as const }],
      render: {
        controls: () =>
          createElement(() => {
            maxZoom = useZoom().maxZoom;
            return null;
          }),
      },
    };

    const { unmount } = renderLightbox(scenario);
    expect(maxZoom).toBe(1);
    unmount();

    renderLightbox({
      ...scenario,
      zoom: { supports: ["custom-slide"] },
    });
    expect(maxZoom).toBe(8);
  });

  it("updates responsive image sizes when zoomed in", async () => {
    renderLightbox({
      slides: [
        { ...slides[0], srcSet: [{ src: "srcset", width: 800, height: 1200 }] },
        { ...slides[1], srcSet: [{ src: "srcset", width: 1200, height: 800 }] },
      ],
    });

    expect(getCurrentSlideImage().sizes).toBe("512px");

    await withFakeTimers(async () => {
      wheelZoom(0, -50);
    });

    expect(getCurrentSlideImage().sizes).toBe("768px");
  });

  it("supports custom image attributes", () => {
    renderLightbox({ carousel: { imageProps: { crossOrigin: "anonymous" } } });

    expect(getCurrentSlideImage().getAttribute("crossOrigin")).toBe("anonymous");
  });

  it("supports custom preload setting", () => {
    const { unmount } = renderLightbox();
    expect(getSlidesCount()).toBe(3);
    unmount();

    renderLightbox({ carousel: { preload: 0 } });
    expect(getSlidesCount()).toBe(1);
  });

  it("transfers focus from offscreen slides", () => {
    const { getByTestId } = renderLightbox({
      slides: [{ type: "custom-slide" }, ...slides],
      render: {
        slide: ({ slide }) => (slide.type === "custom-slide" ? <input data-testid="custom-slide-input" /> : undefined),
      },
    });

    const target = getByTestId("custom-slide-input");
    target.focus();
    expect(document.activeElement).toBe(target);

    clickButtonNext();
    expect(document.activeElement).toBe(getController());
  });
});
