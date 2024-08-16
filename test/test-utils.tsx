import { useState } from "react";
import { expect, vi } from "vitest";
import { UserEvent } from "@testing-library/user-event";
import { act, fireEvent, render, screen } from "@testing-library/react";

import Lightbox, { LightboxProps } from "../src";

export const slides = Array.from({ length: 3 }, (_, i) => ({ src: `http://localhost/image${i + 1}` }));

export function querySelector(selector: string) {
  return document.body.querySelector(selector);
}

export function querySelectorAll(selector: string) {
  return document.body.querySelectorAll(selector);
}

export function getCurrentSlide() {
  return (querySelector(".yarll__slide:not([hidden])") as HTMLDivElement | null) ?? undefined;
}

export function getCurrentSlideSource() {
  return (querySelector(".yarll__slide:not([hidden]) > img") as HTMLImageElement | null)?.src;
}

export function expectCurrentSlideToBe(index: number) {
  expect(getCurrentSlideSource()).toBe(slides[index].src);
}

function getButton(name: string) {
  return screen.getByRole("button", { name });
}

function clickButton(name: string) {
  act(() => {
    getButton(name).click();
  });
}

export function getPreviousButton() {
  return getButton("Previous");
}

export function clickButtonPrev() {
  clickButton("Previous");
}

export function getNextButton() {
  return getButton("Next");
}

export function clickButtonNext() {
  clickButton("Next");
}

export function getCloseButton() {
  return getButton("Close");
}

export function clickButtonClose() {
  clickButton("Close");
}

export function getController() {
  const controller = querySelector(".yarll__portal");
  expect(controller).not.toBeNull();
  return controller!;
}

export async function pointerSwipe(user: UserEvent, target: Element | undefined, deltaX: number, deltaY: number) {
  await user.pointer([
    { keys: "[TouchA>]", target, coords: { x: 0, y: 0 } },
    { keys: "[/TouchA]", target, coords: { x: deltaX, y: deltaY } },
  ]);
}

export async function pointerZoom(user: UserEvent, target: Element | undefined) {
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

    fireEvent.wheel(getCurrentSlide()!, { deltaX, deltaY });
  });
}

export function wheelZoom(deltaX: number, deltaY: number) {
  act(() => {
    fireEvent.wheel(getCurrentSlide()!, { deltaX, deltaY, ctrlKey: true });
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

  expect(getCurrentSlideSource()).toBeUndefined();
}

function isCurrentSlideScaled() {
  return getCurrentSlide()!.style.transform.indexOf("scale") >= 0;
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

    vi.runAllTimers();
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
