import { type Context, type CSSProperties, useContext } from "react";

import type { Label, Labels, Slide, SlideImage } from "./types";

const cssPrefix = "yarll__";

export function cssClass(name: string) {
  return `${cssPrefix}${name}`;
}

export function cssVar(name: string) {
  return `--${cssPrefix}${name}`;
}

export function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function mergeSlot<T extends { className?: string; style?: CSSProperties }>(
  slot: T | undefined,
  className: string,
  style?: CSSProperties,
) {
  return {
    ...slot,
    className: clsx(className, slot?.className),
    style: style || slot?.style ? { ...style, ...slot?.style } : undefined,
  };
}

export function translateLabel(labels: Labels, label: Label) {
  return labels[label as keyof Labels] ?? label;
}

export function translateSlideCounter(labels: Labels, index: number, total: number) {
  return translateLabel(labels, "{index} of {total}")
    .replace(/\{index}/g, `${index}`)
    .replace(/\{total}/g, `${total}`);
}

export function makeUseContext<T>(name: string, context: Context<T | null>) {
  return () => {
    const ctx = useContext(context);
    if (!ctx) throw new Error(`${name} must be used inside <Lightbox>`);
    return ctx;
  };
}

export function round(value: number, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

export function scaleZoom(value: number, delta: number, factor = 100, clamp = 2) {
  return value * Math.min(1 + Math.abs(delta / factor), clamp) ** Math.sign(delta);
}

export function isImageSlide(slide: Slide): slide is SlideImage {
  // noinspection SuspiciousTypeOfGuard
  return (slide.type === undefined || slide.type === "image") && typeof slide.src === "string";
}

export function getChildren(element: Element | null | undefined) {
  return Array.from(element?.children || []);
}

// Walk up from the event target to see if it's inside a subtree the user
// opted out via `.yarll__interactive` — suppresses gestures, wheel handling,
// and keyboard nav in favor of native behavior for custom inputs, scrollable
// panels, captions with text selection, etc.
export function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest(`.${cssClass("interactive")}`) !== null;
}
