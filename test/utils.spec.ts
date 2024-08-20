import { describe } from "vitest";

import { scaleZoom } from "../src/utils";

describe("scaleZoom", (test) => {
  test.for([
    [3, 50, 4.5],
    [3, 100, 6],
    [3, 200, 6],
    [3, -50, 2],
    [3, -100, 1.5],
    [3, -200, 1.5],
  ])("scaleZoom(%i, %i) -> %i", ([value, delta, expected], { expect }) => {
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
  ])("scaleZoom(%i, %i, %i, %i) -> %i", ([value, delta, factor, clamp, expected], { expect }) => {
    expect(scaleZoom(value, delta, factor, clamp)).toBe(expected);
  });
});
