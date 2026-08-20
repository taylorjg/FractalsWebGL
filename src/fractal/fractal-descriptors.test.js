import { describe, expect, it } from "vitest";
import {
  ALT_CLICK_ACTION,
  BARNSLEY_HOME_BOOKMARK,
  BARNSLEY_INITIAL_ITERATIONS,
  buildHomeBookmark,
  COLOUR_MODE,
  cycleFractalSetId,
  formatIterationSummary,
  FRACTAL_DESCRIPTORS,
  FRACTAL_KIND,
  FRACTAL_SET_ID_BARNSLEY,
  FRACTAL_SET_ID_JULIA,
  FRACTAL_SET_ID_MANDELBROT,
  getFractal,
  getHomeBookmark,
  getIterationControlLabel,
  getMaxIterations,
  HOME_BOOKMARK,
  isEscapeTimeFractal,
  JULIA_HOME_BOOKMARK,
  MAX_ITERATIONS_BARNSLEY,
  MAX_ITERATIONS_MANUAL,
  shouldFlipPanY,
  showJuliaConstantInSummary,
  supportsInterestScoring,
  supportsSmoothColouring,
} from "./fractal-descriptors";

describe("fractal-descriptors", () => {
  it("registers Mandelbrot, Julia, and Barnsley in cycle order", () => {
    expect(FRACTAL_DESCRIPTORS.map((descriptor) => descriptor.id)).toEqual([
      FRACTAL_SET_ID_MANDELBROT,
      FRACTAL_SET_ID_JULIA,
      FRACTAL_SET_ID_BARNSLEY,
    ]);
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

  it("builds home bookmarks from descriptors", () => {
    expect(getHomeBookmark(FRACTAL_SET_ID_MANDELBROT)).toEqual(HOME_BOOKMARK);
    expect(getHomeBookmark(FRACTAL_SET_ID_JULIA)).toEqual(JULIA_HOME_BOOKMARK);
    expect(getHomeBookmark(FRACTAL_SET_ID_BARNSLEY)).toEqual(
      BARNSLEY_HOME_BOOKMARK
    );
    expect(buildHomeBookmark(getFractal(FRACTAL_SET_ID_BARNSLEY))).toEqual(
      BARNSLEY_HOME_BOOKMARK
    );
  });

  it("describes Barnsley IFS view and iteration settings", () => {
    const barnsley = getFractal(FRACTAL_SET_ID_BARNSLEY);

    expect(barnsley.kind).toBe(FRACTAL_KIND.IFS);
    expect(barnsley.colouring.mode).toBe(COLOUR_MODE.FIXED);
    expect(barnsley.view.flipPanY).toBe(true);
    expect(barnsley.view.reflectRegionY).toBe(true);
    expect(getMaxIterations(FRACTAL_SET_ID_BARNSLEY)).toBe(
      MAX_ITERATIONS_BARNSLEY
    );
    expect(BARNSLEY_INITIAL_ITERATIONS).toBeLessThan(MAX_ITERATIONS_BARNSLEY);
    expect(getIterationControlLabel(FRACTAL_SET_ID_BARNSLEY)).toBe("IFS Steps");
    expect(formatIterationSummary(FRACTAL_SET_ID_BARNSLEY, 16384)).toBe(
      "16384 steps"
    );
  });

  it("describes escape-time capabilities for Mandelbrot and Julia", () => {
    expect(isEscapeTimeFractal(FRACTAL_SET_ID_MANDELBROT)).toBe(true);
    expect(isEscapeTimeFractal(FRACTAL_SET_ID_JULIA)).toBe(true);
    expect(isEscapeTimeFractal(FRACTAL_SET_ID_BARNSLEY)).toBe(false);
    expect(supportsSmoothColouring(FRACTAL_SET_ID_MANDELBROT)).toBe(true);
    expect(supportsSmoothColouring(FRACTAL_SET_ID_BARNSLEY)).toBe(false);
    expect(showJuliaConstantInSummary(FRACTAL_SET_ID_JULIA)).toBe(true);
    expect(showJuliaConstantInSummary(FRACTAL_SET_ID_MANDELBROT)).toBe(false);
    expect(getMaxIterations(FRACTAL_SET_ID_MANDELBROT)).toBe(
      MAX_ITERATIONS_MANUAL
    );
  });

  it("declares auto-mode and alt-click behaviour per fractal", () => {
    expect(supportsInterestScoring(FRACTAL_SET_ID_MANDELBROT)).toBe(true);
    expect(supportsInterestScoring(FRACTAL_SET_ID_BARNSLEY)).toBe(false);
    expect(shouldFlipPanY(FRACTAL_SET_ID_BARNSLEY)).toBe(true);
    expect(shouldFlipPanY(FRACTAL_SET_ID_MANDELBROT)).toBe(false);
    expect(getFractal(FRACTAL_SET_ID_MANDELBROT).altClick.action).toBe(
      ALT_CLICK_ACTION.TO_JULIA_WITH_PICK
    );
    expect(getFractal(FRACTAL_SET_ID_BARNSLEY).altClick).toEqual({
      action: ALT_CLICK_ACTION.TO_FRACTAL,
      fractalSetId: FRACTAL_SET_ID_MANDELBROT,
    });
  });
});
