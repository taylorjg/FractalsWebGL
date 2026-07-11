import { describe, expect, it } from "vitest";
import {
  analyzeIterationPixels,
  encodeIterationPixel,
  FINAL_INTEREST_THRESHOLDS,
  isInterestingDistribution,
  scoreDistribution,
} from "./configuration-interest";

const pixelsFromIterations = (iterations, width) => {
  const height = iterations.length / width;
  const pixels = new Uint8Array(iterations.length * 4);
  iterations.forEach((iteration, index) => {
    const [lo, hi, , alpha] = encodeIterationPixel(iteration);
    const offset = index * 4;
    pixels[offset] = lo;
    pixels[offset + 1] = hi;
    pixels[offset + 2] = 0;
    pixels[offset + 3] = alpha;
  });
  return { pixels, width, height };
};

describe("analyzeIterationPixels", () => {
  it("rejects a flat frame dominated by one iteration", () => {
    const { pixels, width, height } = pixelsFromIterations(Array(64).fill(128), 8);
    const analysis = analyzeIterationPixels(pixels, 128, width, height);

    expect(analysis.boundaryFraction).toBe(0);
    expect(analysis.edgeDensity).toBe(0);
    expect(analysis.maxBinFraction).toBe(1);
    expect(isInterestingDistribution(analysis)).toBe(false);
  });

  it("rejects mostly interior and exterior with a thin boundary", () => {
    const iterations = [
      ...Array(45).fill(0),
      ...Array(5).fill(40),
      ...Array(45).fill(128),
    ];
    const { pixels, width, height } = pixelsFromIterations(iterations, 10);
    const analysis = analyzeIterationPixels(pixels, 128, width, height);

    expect(analysis.boundaryFraction).toBeCloseTo(0.053, 2);
    expect(isInterestingDistribution(analysis)).toBe(false);
  });

  it("accepts a boundary-rich distribution with visible edges", () => {
    const width = 8;
    const iterations = Array.from({ length: 64 }, (_, index) => 8 + (index % 24));
    const { pixels, height } = pixelsFromIterations(iterations, width);
    const analysis = analyzeIterationPixels(pixels, 128, width, height);

    expect(analysis.boundaryFraction).toBe(1);
    expect(analysis.edgeDensity).toBeGreaterThan(0.12);
    expect(isInterestingDistribution(analysis)).toBe(true);
    expect(scoreDistribution(analysis)).toBeGreaterThan(1.35);
  });

  it("rejects a mostly exterior final frame even when the initial check would pass", () => {
    const iterations = [
      ...Array(48).fill(0),
      ...Array.from({ length: 25 }, (_, index) => index + 1),
      ...Array(27).fill(128),
    ];
    const { pixels, width, height } = pixelsFromIterations(iterations, 10);
    const analysis = analyzeIterationPixels(pixels, 128, width, height);

    expect(analysis.boundaryFraction).toBe(0.25);
    expect(analysis.exteriorFraction).toBe(0.48);
    expect(isInterestingDistribution(analysis)).toBe(true);
    expect(isInterestingDistribution(analysis, FINAL_INTEREST_THRESHOLDS)).toBe(false);
  });

  it("rejects a mostly interior final frame even when the initial check would pass", () => {
    const iterations = [
      ...Array(25).fill(0),
      ...Array.from({ length: 25 }, (_, index) => index + 1),
      ...Array(50).fill(128),
    ];
    const { pixels, width, height } = pixelsFromIterations(iterations, 10);
    const analysis = analyzeIterationPixels(pixels, 128, width, height);

    expect(analysis.boundaryFraction).toBe(0.25);
    expect(analysis.interiorFraction).toBe(0.5);
    expect(isInterestingDistribution(analysis)).toBe(true);
    expect(isInterestingDistribution(analysis, FINAL_INTEREST_THRESHOLDS)).toBe(false);
  });
});
