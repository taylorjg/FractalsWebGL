import { describe, expect, it } from "vitest";
import {
  AUTO_MIN_HALF_WIDTH,
  clampAutoHalfWidth,
  createRandomAutoConfiguration,
  getVividColourMapIds,
  halfWidthFromConfiguration,
} from "./auto-seeds";

describe("auto-seeds", () => {
  it("prefers vivid colour maps most of the time", () => {
    const colourMapIds = Array.from({ length: 40 }, (_, id) => id);
    const vividIds = new Set(getVividColourMapIds());
    let vividCount = 0;

    for (let index = 0; index < 200; index++) {
      const configuration = createRandomAutoConfiguration(colourMapIds, {
        maxPanSpeed: 0.035,
        minZoomSpeed: 0.05,
        maxZoomSpeed: 0.12,
      });
      if (vividIds.has(configuration.colourMapId)) {
        vividCount++;
      }
    }

    expect(vividCount).toBeGreaterThan(120);
  });

  it("creates zoom-in-biased motion and scaled iteration counts", () => {
    const colourMapIds = [0, 1, 2];
    const configuration = createRandomAutoConfiguration(colourMapIds, {
      maxPanSpeed: 0.035,
      minZoomSpeed: 0.05,
      maxZoomSpeed: 0.12,
    });

    expect(configuration.zoomSpeed).toBeGreaterThanOrEqual(0.05);
    expect(Math.abs(configuration.panSpeedX)).toBeLessThanOrEqual(0.035);
    expect(Math.abs(configuration.panSpeedY)).toBeLessThanOrEqual(0.035);
    expect(configuration.maxIterations).toBeGreaterThanOrEqual(128);
    expect(configuration.maxIterations).toBeLessThanOrEqual(2048);
  });

  it("never starts deeper than the auto minimum half-width", () => {
    const colourMapIds = [0, 1, 2];

    for (let index = 0; index < 200; index++) {
      const configuration = createRandomAutoConfiguration(colourMapIds, {
        maxPanSpeed: 0.035,
        minZoomSpeed: 0.05,
        maxZoomSpeed: 0.12,
      });
      expect(halfWidthFromConfiguration(configuration)).toBeGreaterThan(AUTO_MIN_HALF_WIDTH - 1e-6);
    }
  });

  it("clamps requested half-width to the auto minimum", () => {
    expect(clampAutoHalfWidth(0.00001)).toBe(AUTO_MIN_HALF_WIDTH);
    expect(clampAutoHalfWidth(0.01)).toBe(0.01);
  });
});
