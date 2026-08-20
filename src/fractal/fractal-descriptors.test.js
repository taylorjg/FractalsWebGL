import { describe, expect, it } from "vitest";
import {
  ALT_CLICK_ACTION,
  BARNSLEY_HOME_BOOKMARK,
  BARNSLEY_INITIAL_ITERATIONS,
  buildHomeBookmark,
  COLOUR_MODE,
  cycleFractalSetId,
  DRAGON_HOME_BOOKMARK,
  formatIterationSummary,
  FRACTAL_DESCRIPTORS,
  FRACTAL_KIND,
  FRACTAL_SET_ID_BARNSLEY,
  FRACTAL_SET_ID_DRAGON,
  FRACTAL_SET_ID_JULIA,
  FRACTAL_SET_ID_MANDELBROT,
  FRACTAL_SET_ID_SIERPINSKI,
  getFractal,
  getHomeBookmark,
  getIterationControlLabel,
  getMaxIterations,
  HOME_BOOKMARK,
  IFS_INITIAL_ITERATIONS,
  isEscapeTimeFractal,
  isIfsFractal,
  JULIA_HOME_BOOKMARK,
  MAX_ITERATIONS_IFS,
  MAX_ITERATIONS_MANUAL,
  SIERPINSKI_HOME_BOOKMARK,
  shouldFlipPanY,
  showJuliaConstantInSummary,
  supportsInterestScoring,
  supportsSmoothColouring,
} from "./fractal-descriptors";

describe("fractal-descriptors", () => {
  it("registers all fractals in cycle order", () => {
    expect(FRACTAL_DESCRIPTORS.map((descriptor) => descriptor.id)).toEqual([
      FRACTAL_SET_ID_MANDELBROT,
      FRACTAL_SET_ID_JULIA,
      FRACTAL_SET_ID_BARNSLEY,
      FRACTAL_SET_ID_SIERPINSKI,
      FRACTAL_SET_ID_DRAGON,
    ]);
    expect(cycleFractalSetId(FRACTAL_SET_ID_MANDELBROT)).toBe(
      FRACTAL_SET_ID_JULIA
    );
    expect(cycleFractalSetId(FRACTAL_SET_ID_JULIA)).toBe(
      FRACTAL_SET_ID_BARNSLEY
    );
    expect(cycleFractalSetId(FRACTAL_SET_ID_BARNSLEY)).toBe(
      FRACTAL_SET_ID_SIERPINSKI
    );
    expect(cycleFractalSetId(FRACTAL_SET_ID_SIERPINSKI)).toBe(
      FRACTAL_SET_ID_DRAGON
    );
    expect(cycleFractalSetId(FRACTAL_SET_ID_DRAGON)).toBe(
      FRACTAL_SET_ID_MANDELBROT
    );
  });

  it("builds home bookmarks from descriptors", () => {
    expect(getHomeBookmark(FRACTAL_SET_ID_MANDELBROT)).toEqual(HOME_BOOKMARK);
    expect(getHomeBookmark(FRACTAL_SET_ID_JULIA)).toEqual(JULIA_HOME_BOOKMARK);
    expect(getHomeBookmark(FRACTAL_SET_ID_BARNSLEY)).toEqual(
      BARNSLEY_HOME_BOOKMARK
    );
    expect(getHomeBookmark(FRACTAL_SET_ID_SIERPINSKI)).toEqual(
      SIERPINSKI_HOME_BOOKMARK
    );
    expect(getHomeBookmark(FRACTAL_SET_ID_DRAGON)).toEqual(
      DRAGON_HOME_BOOKMARK
    );
    expect(buildHomeBookmark(getFractal(FRACTAL_SET_ID_BARNSLEY))).toEqual(
      BARNSLEY_HOME_BOOKMARK
    );
  });

  it("describes IFS view and iteration settings", () => {
    for (const fractalSetId of [
      FRACTAL_SET_ID_BARNSLEY,
      FRACTAL_SET_ID_SIERPINSKI,
      FRACTAL_SET_ID_DRAGON,
    ]) {
      const descriptor = getFractal(fractalSetId);

      expect(descriptor.kind).toBe(FRACTAL_KIND.IFS);
      expect(descriptor.colouring.mode).toBe(COLOUR_MODE.FIXED);
      expect(descriptor.view.flipPanY).toBe(true);
      expect(descriptor.view.reflectRegionY).toBe(true);
      expect(isIfsFractal(fractalSetId)).toBe(true);
      expect(getMaxIterations(fractalSetId)).toBe(MAX_ITERATIONS_IFS);
      expect(getIterationControlLabel(fractalSetId)).toBe("IFS Steps");
      expect(formatIterationSummary(fractalSetId, 16384)).toBe("16384 steps");
    }

    expect(IFS_INITIAL_ITERATIONS).toBeLessThan(MAX_ITERATIONS_IFS);
    expect(BARNSLEY_INITIAL_ITERATIONS).toBe(IFS_INITIAL_ITERATIONS);
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
    expect(supportsInterestScoring(FRACTAL_SET_ID_SIERPINSKI)).toBe(false);
    expect(shouldFlipPanY(FRACTAL_SET_ID_BARNSLEY)).toBe(true);
    expect(shouldFlipPanY(FRACTAL_SET_ID_SIERPINSKI)).toBe(true);
    expect(shouldFlipPanY(FRACTAL_SET_ID_MANDELBROT)).toBe(false);
    expect(getFractal(FRACTAL_SET_ID_MANDELBROT).altClick.action).toBe(
      ALT_CLICK_ACTION.TO_JULIA_WITH_PICK
    );
    expect(getFractal(FRACTAL_SET_ID_BARNSLEY).altClick).toEqual({
      action: ALT_CLICK_ACTION.TO_FRACTAL,
      fractalSetId: FRACTAL_SET_ID_MANDELBROT,
    });
    expect(getFractal(FRACTAL_SET_ID_SIERPINSKI).altClick).toEqual({
      action: ALT_CLICK_ACTION.TO_FRACTAL,
      fractalSetId: FRACTAL_SET_ID_MANDELBROT,
    });
  });
});
