import { Context, useContext } from "react";
import { flushSync } from "react-dom";

import { Callback, Label, Labels, Slide, SlideImage } from "./types";

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

export function transition(callback: Callback) {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      flushSync(callback);
    });
  } else {
    callback();
  }
}

export function translateLabel(labels: Labels | undefined, label: Label) {
  return labels?.[label] ?? label;
}

export function translateSlideCounter(labels: Labels | undefined, index: number, total: number) {
  return translateLabel(labels, "{index} of {total}")
    .replace(/\{index}/g, `${index}`)
    .replace(/\{total}/g, `${total}`);
}

export function makeUseContext<T>(context: Context<T | null>) {
  return () => {
    const ctx = useContext(context);
    // intentionally no message — stack trace is sufficient for internal use
    if (!ctx) throw new Error();
    return ctx;
  };
}

export function round(value: number, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
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
