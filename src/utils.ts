import { Context, useContext } from "react";
import { flushSync } from "react-dom";

import { Callback, Label, Labels } from "./types";

const cssPrefix = "yarll__";

export function cssClass(name: string) {
  return `${cssPrefix}${name}`;
}

export function cssVar(name: string) {
  return `--${cssPrefix}${name}`;
}

export function clsx(...classes: (string | boolean | undefined)[]) {
  return [...classes].filter(Boolean).join(" ");
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

export function makeUseContext<T>(context: Context<T | null>) {
  return () => {
    const ctx = useContext(context);
    if (!ctx) throw new Error();
    return ctx;
  };
}
