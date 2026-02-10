import { describe, expect, it } from "vitest";

import {
  clsx,
  cssClass,
  cssVar,
  getChildren,
  isImageSlide,
  round,
  scaleZoom,
  translateLabel,
  translateSlideCounter,
} from "../src/utils";

describe("scaleZoom", (test) => {
  test.for([
    [3, 50, 4.5],
    [3, 100, 6],
    [3, 200, 6],
    [3, -50, 2],
    [3, -100, 1.5],
    [3, -200, 1.5],
  ] as const)("scaleZoom(%i, %i) -> %i", ([value, delta, expected], { expect }) => {
    expect(scaleZoom(value, delta)).toBe(expected);
  });

  test.for([
    [3, 50, 100, 3, 4.5],
    [3, 100, 100, 3, 6],
    [3, 200, 100, 3, 9],
    [3, 300, 100, 3, 9],
    [3, -50, 100, 3, 2],
    [3, -100, 100, 3, 1.5],
    [3, -200, 100, 3, 1],
    [3, -300, 100, 3, 1],
  ] as const)("scaleZoom(%i, %i, %i, %i) -> %i", ([value, delta, factor, clamp, expected], { expect }) => {
    expect(scaleZoom(value, delta, factor, clamp)).toBe(expected);
  });
});

describe("clsx", () => {
  it("joins multiple class names", () => {
    expect(clsx("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(clsx("a", false, undefined, "b", false)).toBe("a b");
  });

  it("returns empty string when all values are falsy", () => {
    expect(clsx(false, undefined)).toBe("");
  });

  it("returns empty string with no arguments", () => {
    expect(clsx()).toBe("");
  });
});

describe("cssClass", () => {
  it("adds the yarll__ prefix", () => {
    expect(cssClass("slide")).toBe("yarll__slide");
  });
});

describe("cssVar", () => {
  it("adds the --yarll__ prefix", () => {
    expect(cssVar("color")).toBe("--yarll__color");
  });
});

describe("translateLabel", () => {
  it("returns the label as-is when labels is undefined", () => {
    expect(translateLabel(undefined, "Close")).toBe("Close");
  });

  it("returns the label as-is when key is not in labels", () => {
    expect(translateLabel({}, "Close")).toBe("Close");
  });

  it("returns the custom label when provided", () => {
    expect(translateLabel({ Close: "Fermer" }, "Close")).toBe("Fermer");
  });
});

describe("translateSlideCounter", () => {
  it("returns default template with placeholders replaced", () => {
    expect(translateSlideCounter(undefined, 3, 10)).toBe("3 of 10");
  });

  it("uses custom label template", () => {
    expect(translateSlideCounter({ "{index} of {total}": "Photo {index} sur {total}" }, 2, 5)).toBe("Photo 2 sur 5");
  });
});

describe("round", () => {
  it("rounds to integer by default", () => {
    expect(round(1.5)).toBe(2);
    expect(round(1.4)).toBe(1);
  });

  it("rounds to specified decimal places", () => {
    expect(round(1.555, 2)).toBe(1.56);
    expect(round(1.554, 2)).toBe(1.55);
  });

  it("handles zero decimals explicitly", () => {
    expect(round(2.7, 0)).toBe(3);
  });
});

describe("isImageSlide", () => {
  it("returns true for a slide with src and no type", () => {
    expect(isImageSlide({ src: "photo.jpg" })).toBe(true);
  });

  it("returns true for a slide with type 'image'", () => {
    expect(isImageSlide({ type: "image", src: "photo.jpg" })).toBe(true);
  });

  it("returns false when src is missing", () => {
    expect(isImageSlide({} as never)).toBe(false);
  });
});

describe("getChildren", () => {
  it("returns children of an element", () => {
    const parent = document.createElement("div");
    parent.appendChild(document.createElement("span"));
    parent.appendChild(document.createElement("span"));
    expect(getChildren(parent)).toHaveLength(2);
  });

  it("returns empty array for null", () => {
    expect(getChildren(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(getChildren(undefined)).toEqual([]);
  });

  it("returns empty array for element with no children", () => {
    expect(getChildren(document.createElement("div"))).toEqual([]);
  });
});
