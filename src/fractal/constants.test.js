import { describe, expect, it } from "vitest";
import {
  BARNSLEY_HOME_BOOKMARK,
  BARNSLEY_INITIAL_ITERATIONS,
  cycleFractalSetId,
  FRACTAL_SET_ID_BARNSLEY,
  FRACTAL_SET_ID_JULIA,
  FRACTAL_SET_ID_MANDELBROT,
  getHomeBookmark,
  getMaxIterations,
  HOME_BOOKMARK,
  JULIA_HOME_BOOKMARK,
  isEscapeTimeFractal,
  MAX_ITERATIONS_BARNSLEY,
  MAX_ITERATIONS_MANUAL,
} from "./constants";

describe("constants", () => {
  it("cycles fractal set ids through Mandelbrot, Julia, and Barnsley", () => {
    expect(cycleFractalSetId(FRACTAL_SET_ID_MANDELBROT)).toBe(
      FRACTAL_SET_ID_JULIA
    );
    expect(cycleFractalSetId(FRACTAL_SET_ID_JULIA)).toBe(
      FRACTAL_SET_ID_BARNSLEY
    );
    expect(cycleFractalSetId(FRACTAL_SET_ID_BARNSLEY)).toBe(
      FRACTAL_SET_ID_MANDELBROT
    );
  });

  it("returns the correct home bookmark for each fractal type", () => {
    expect(getHomeBookmark(FRACTAL_SET_ID_MANDELBROT)).toEqual(HOME_BOOKMARK);
    expect(getHomeBookmark(FRACTAL_SET_ID_JULIA)).toEqual(JULIA_HOME_BOOKMARK);
    expect(getHomeBookmark(FRACTAL_SET_ID_BARNSLEY)).toEqual(
      BARNSLEY_HOME_BOOKMARK
    );
  });

  it("defines Barnsley home region bounds for the full fern", () => {
    expect(BARNSLEY_HOME_BOOKMARK.regionBottomLeft).toEqual({ x: -2.5, y: 0 });
    expect(BARNSLEY_HOME_BOOKMARK.regionTopRight).toEqual({ x: 2.5, y: 10 });
    expect(BARNSLEY_HOME_BOOKMARK.fractalSetId).toBe(FRACTAL_SET_ID_BARNSLEY);
    expect(BARNSLEY_HOME_BOOKMARK.maxIterations).toBe(BARNSLEY_INITIAL_ITERATIONS);
  });

  it("uses a higher iteration ceiling for Barnsley than escape-time fractals", () => {
    expect(getMaxIterations(FRACTAL_SET_ID_MANDELBROT)).toBe(
      MAX_ITERATIONS_MANUAL
    );
    expect(getMaxIterations(FRACTAL_SET_ID_BARNSLEY)).toBe(
      MAX_ITERATIONS_BARNSLEY
    );
    expect(BARNSLEY_INITIAL_ITERATIONS).toBeLessThan(MAX_ITERATIONS_BARNSLEY);
  });

  it("classifies escape-time fractals separately from Barnsley", () => {
    expect(isEscapeTimeFractal(FRACTAL_SET_ID_MANDELBROT)).toBe(true);
    expect(isEscapeTimeFractal(FRACTAL_SET_ID_JULIA)).toBe(true);
    expect(isEscapeTimeFractal(FRACTAL_SET_ID_BARNSLEY)).toBe(false);
  });
});
