import { describe, expect, it } from "vitest";

import { scaleZoom } from "../src/utils";

describe("scaleZoom", () => {
  it.each([
    [3, 50, 4.5],
    [3, -50, 2],
    [3, 100, 6],
    [3, 200, 6],
    [3, -100, 1.5],
    [3, -200, 1.5],
  ])(`scale(%i, %i) -> %i`, (value, delta, expected) => {
    expect(scaleZoom(value, delta)).toBe(expected);
  });
});
