import { useState } from "react";
import { expect, vi } from "vitest";
import { UserEvent } from "@testing-library/user-event";
import { act, fireEvent, render, screen } from "@testing-library/react";

import Lightbox, { LightboxProps } from "../src";

export const slides = Array.from({ length: 3 }, (_, i) => ({ src: `http://localhost/image${i + 1}` }));

function expectToBeNotNull<T>(value: T | null): asserts value is T {
  expect(value).not.toBeNull();
}

export function querySelector<E extends Element = Element>(selector: string) {
  return document.body.querySelector<E>(selector);
}

export function querySelectorAll<E extends Element = Element>(selector: string) {
  return document.body.querySelectorAll<E>(selector);
}

function getSelector<E extends Element = Element>(selector: string) {
  const element = querySelector<E>(selector);
  expectToBeNotNull(element);
  return element;
}

export function getController() {
  return getSelector<HTMLDivElement>(".yarll__portal");
}

export function getCurrentSlide() {
  return getSelector<HTMLDivElement>(".yarll__slide:not([hidden])");
}

export function getCurrentSlideImage() {
  return getSelector<HTMLImageElement>(".yarll__slide:not([hidden]) .yarll__slide_image");
}

export function getSlidesCount() {
  return querySelectorAll(".yarll__slide").length;
}

function queryCurrentSlideSource() {
  return querySelector<HTMLImageElement>(".yarll__slide:not([hidden]) .yarll__slide_image")?.src;
}

export function expectCurrentSlideToBe(index: number) {
  expect(queryCurrentSlideSource()).toBe(slides[index].src);
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

export async function pointerZoom(user: UserEvent, target: Element) {
  await user.pointer([
    { keys: "[TouchA>]", target, coords: { x: 0, y: 0 } },
    { keys: "[TouchB>]", target, coords: { x: 0, y: 0 } },
    { keys: "[/TouchB]", target, coords: { x: 100, y: 100 } },
    { keys: "[/TouchA]", target, coords: { x: -100, y: -100 } },
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

function LightboxTest(props: Omit<LightboxProps, "index" | "setIndex">) {
  const [index, setIndex] = useState<number | undefined>(0);
  return <Lightbox index={index} setIndex={setIndex} {...props} />;
}

export function renderLightbox(props?: Omit<Partial<LightboxProps>, "index" | "setIndex">) {
  return render(<LightboxTest slides={slides} {...props} />);
}

export async function expectLightboxToBeClosed() {
  await act(async () => {
    fireEvent.transitionEnd(getController());
  });

  expect(queryCurrentSlideSource()).toBeUndefined();
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
