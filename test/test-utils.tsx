import { type ComponentProps, useState } from "react";
import { expect, vi } from "vitest";
import type { UserEvent } from "@testing-library/user-event";
import { act, fireEvent, render, screen } from "@testing-library/react";

import Lightbox from "../src";

export const slides = [
  { src: "http://localhost/image1" },
  { src: "http://localhost/image2" },
  { src: "http://localhost/image3" },
] as const;

function expectToBeDefined<T>(value: T): asserts value is NonNullable<T> {
  expect(value).not.toBeNullable();
}

export function querySelector<E extends Element = Element>(selector: string) {
  return document.body.querySelector<E>(selector);
}

export function querySelectorAll<E extends Element = Element>(selector: string) {
  return document.body.querySelectorAll<E>(selector);
}

function getSelector<E extends Element = Element>(selector: string) {
  const element = querySelector<E>(selector);
  expectToBeDefined(element);
  return element;
}

export function queryPortal() {
  return querySelector<HTMLDivElement>(".yarll__portal");
}

export function getPortal() {
  return getSelector<HTMLDivElement>(".yarll__portal");
}

export function getCurrentSlide() {
  return getSelector<HTMLDivElement>(".yarll__slide_current");
}

// Taps on `.yarll__slide` and `.yarll__portal` are treated as backdrop clicks, so
// tap-based gesture tests that must NOT trigger backdrop-close should target the
// inner image element instead of the slide container.
export function getCurrentSlideImage() {
  return getSelector<HTMLImageElement>(".yarll__slide_current .yarll__slide_image");
}

export function getSlidesCount() {
  return querySelectorAll(".yarll__slide").length;
}

export function querySlideAtOffset(offset: number) {
  return querySelector<HTMLDivElement>(`.yarll__slide[data-offset="${offset}"]`);
}

export function queryCurrentSlideSource() {
  return querySelector<HTMLImageElement>(".yarll__slide_current .yarll__slide_image")?.src;
}

export function expectCurrentSlideToBe(index: number) {
  const slide = slides[index];
  expectToBeDefined(slide);
  expect(queryCurrentSlideSource()).toBe(slide.src);
}

function getButton(name: string) {
  return screen.getByRole<HTMLButtonElement>("button", { name });
}

function clickButton(button: HTMLButtonElement) {
  act(() => {
    button.click();
  });
}

export function getPreviousButton() {
  return getButton("Previous");
}

export function clickButtonPrev() {
  clickButton(getPreviousButton());
}

export function getNextButton() {
  return getButton("Next");
}

export function clickButtonNext() {
  clickButton(getNextButton());
}

export function getCloseButton() {
  return getButton("Close");
}

export function clickButtonClose() {
  clickButton(getCloseButton());
}

export async function pointerSwipe(user: UserEvent, target: Element, deltaX: number, deltaY: number) {
  await user.pointer([
    { keys: "[TouchA>]", target, coords: { x: 0, y: 0 } },
    { keys: "[/TouchA]", target, coords: { x: deltaX, y: deltaY } },
  ]);
}

export function wheelSwipe(deltaX: number, deltaY: number, delay = 2_000) {
  act(() => {
    vi.setSystemTime(Date.now() + delay);

    fireEvent.wheel(getCurrentSlide(), { deltaX, deltaY });
  });
}

export function wheelZoom(deltaX: number, deltaY: number) {
  act(() => {
    fireEvent.wheel(getCurrentSlide(), { deltaX, deltaY, ctrlKey: true });
  });
}

type LightboxTestProps = Partial<ComponentProps<typeof Lightbox>>;

function LightboxTest(props: LightboxTestProps) {
  const [index, setIndex] = useState<number | undefined>(0);
  return <Lightbox slides={slides} index={index} setIndex={setIndex} {...props} />;
}

export function renderLightbox(props?: LightboxTestProps) {
  let currentProps = props;
  const { rerender, ...rest } = render(<LightboxTest {...currentProps} />);
  return {
    ...rest,
    rerender: (nextProps?: LightboxTestProps) => {
      currentProps = { ...currentProps, ...nextProps };
      rerender(<LightboxTest {...currentProps} />);
    },
  };
}

export async function expectLightboxToBeOpen() {
  expect(queryPortal()).not.toBeNull();
}

export async function expectLightboxToBeClosed() {
  if (queryPortal()) {
    await act(async () => {
      if (vi.isFakeTimers()) {
        vi.runAllTimers();
      } else {
        // jsdom resolves transitionDuration to 0s, so the exit setTimeout
        // fires on the next macrotask — wait one tick.
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    });
  }

  expect(queryPortal()).toBeNull();
}

function isCurrentSlideScaled() {
  return getCurrentSlide().style.transform.indexOf("scale") >= 0;
}

export function expectToBeZoomedIn() {
  expect(isCurrentSlideScaled()).toBe(true);
}

export function expectToBeZoomedOut() {
  expect(isCurrentSlideScaled()).toBe(false);
}

export function expectToBeSoftDisabled(button: HTMLButtonElement) {
  expect(button).toHaveAttribute("aria-disabled", "true");
  expect(button).not.toBeDisabled();
}

export function expectNotToBeSoftDisabled(button: HTMLButtonElement) {
  expect(button).not.toHaveAttribute("aria-disabled", "true");
}

export async function withFakeTimers(callback: () => Promise<void>) {
  vi.useFakeTimers();
  try {
    await callback();

    await act(async () => {
      vi.runAllTimers();
    });
  } finally {
    vi.useRealTimers();
  }
}

/* eslint-disable no-console */
export function suppressConsoleErrors(callback: () => void) {
  const consoleError = console.error;
  console.error = vi.fn();
  try {
    callback();
  } finally {
    console.error = consoleError;
  }
}
