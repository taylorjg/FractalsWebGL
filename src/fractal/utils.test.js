import { afterEach, describe, expect, it, vi } from "vitest";
import { clamp, randomElement, randomFloat, randomInt } from "./utils";

describe("clamp", () => {
  it("returns the value when it is within bounds", () => {
    expect(clamp(0, 10, 5)).toBe(5);
  });

  it("returns the minimum when the value is too low", () => {
    expect(clamp(0, 10, -3)).toBe(0);
  });

  it("returns the maximum when the value is too high", () => {
    expect(clamp(0, 10, 12)).toBe(10);
  });
});

describe("random helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("randomFloat maps Math.random to the requested range", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(randomFloat(2, 6)).toBe(2);

    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(randomFloat(2, 6)).toBe(4);

    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(randomFloat(2, 6)).toBeCloseTo(5.96);
  });

  it("randomInt returns the lower bound when Math.random is zero", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(randomInt(3, 7)).toBe(3);
  });

  it("randomElement picks using a floored random index", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(randomElement(["a", "b", "c", "d"])).toBe("c");
  });
});
