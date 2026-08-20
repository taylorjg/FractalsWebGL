import { describe, expect, it } from "vitest";
import {
  BARNSLEY_HOME_BOOKMARK,
  FRACTAL_SET_ID_BARNSLEY,
  getHomeBookmark,
  HOME_BOOKMARK,
  INITIAL_BOOKMARK,
  INITIAL_ITERATIONS,
  JULIA_HOME_BOOKMARK,
} from "./constants";

describe("constants", () => {
  it("re-exports descriptor home bookmarks", () => {
    expect(getHomeBookmark(0)).toEqual(HOME_BOOKMARK);
    expect(getHomeBookmark(1)).toEqual(JULIA_HOME_BOOKMARK);
    expect(getHomeBookmark(2)).toEqual(BARNSLEY_HOME_BOOKMARK);
  });

  it("keeps the initial Mandelbrot zoom bookmark separate from home", () => {
    expect(INITIAL_BOOKMARK.maxIterations).toBe(INITIAL_ITERATIONS);
    expect(INITIAL_BOOKMARK.fractalSetId).toBe(0);
    expect(INITIAL_BOOKMARK.regionBottomLeft).toEqual({ x: -0.22, y: -0.7 });
  });

  it("re-exports Barnsley home region bounds", () => {
    expect(BARNSLEY_HOME_BOOKMARK.regionBottomLeft).toEqual({ x: -2.5, y: 0 });
    expect(BARNSLEY_HOME_BOOKMARK.regionTopRight).toEqual({ x: 2.5, y: 10 });
    expect(BARNSLEY_HOME_BOOKMARK.fractalSetId).toBe(FRACTAL_SET_ID_BARNSLEY);
  });
});
