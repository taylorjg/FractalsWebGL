import { describe, expect, it } from "vitest";
import { Region } from "./region";

const setSquareRegion = (region, size = 2, origin = 0) => {
  region.set({ x: origin, y: origin }, { x: origin + size, y: origin + size });
};

describe("Region", () => {
  describe("geometry", () => {
    it("reports width, height, and centre from set bounds", () => {
      const region = new Region();
      region.set({ x: -1, y: -2 }, { x: 3, y: 4 });

      expect(region.width).toBe(4);
      expect(region.height).toBe(6);
      expect(region.centreX).toBe(1);
      expect(region.centreY).toBe(1);
    });

    it("exposes corner getters", () => {
      const region = new Region();
      region.set({ x: 1, y: 2 }, { x: 5, y: 8 });

      expect(region.topLeft).toEqual({ x: 1, y: 8 });
      expect(region.topRight).toEqual({ x: 5, y: 8 });
      expect(region.bottomLeft).toEqual({ x: 1, y: 2 });
      expect(region.bottomRight).toEqual({ x: 5, y: 2 });
    });

    it("returns copies from mutable corner getters", () => {
      const region = new Region();
      setSquareRegion(region);

      const bottomLeft = region.bottomLeft;
      bottomLeft.x = 99;

      expect(region.bottomLeft).toEqual({ x: 0, y: 0 });
    });
  });

  describe("adjustAspectRatio", () => {
    it("widens a square region for landscape canvases", () => {
      const region = new Region();
      setSquareRegion(region);

      region.adjustAspectRatio(800, 600);

      expect(region.height).toBe(2);
      expect(region.width).toBeCloseTo(2 + 2 / 3);
      expect(region.centreX).toBeCloseTo(1);
      expect(region.centreY).toBe(1);
    });

    it("tallens a square region for portrait canvases", () => {
      const region = new Region();
      setSquareRegion(region);

      region.adjustAspectRatio(600, 800);

      expect(region.width).toBe(2);
      expect(region.height).toBeCloseTo(2 + 2 / 3);
      expect(region.centreX).toBe(1);
      expect(region.centreY).toBeCloseTo(1);
    });
  });

  describe("zoom", () => {
    it("shrinks the region around its centre", () => {
      const region = new Region();
      setSquareRegion(region);

      region.zoom(10);

      expect(region.width).toBeCloseTo(1.8);
      expect(region.height).toBeCloseTo(1.8);
      expect(region.centreX).toBeCloseTo(1);
      expect(region.centreY).toBeCloseTo(1);
    });
  });

  describe("pan", () => {
    it("pans horizontally by a percentage of the current width", () => {
      const region = new Region();
      setSquareRegion(region);

      region.panX(50);

      expect(region.left).toBe(-1);
      expect(region.right).toBe(1);
      expect(region.centreX).toBe(0);
    });

    it("pans vertically by a percentage of the current height", () => {
      const region = new Region();
      setSquareRegion(region);

      region.panY(25);

      expect(region.bottom).toBe(-0.5);
      expect(region.top).toBe(1.5);
      expect(region.centreY).toBe(0.5);
    });
  });

  describe("drag", () => {
    it("translates the region proportionally to canvas size", () => {
      const region = new Region();
      setSquareRegion(region);
      const canvas = { width: 800, height: 600 };

      region.drag(canvas, 80, 60);

      expect(region.left).toBeCloseTo(-0.2);
      expect(region.bottom).toBeCloseTo(-0.2);
      expect(region.right).toBeCloseTo(1.8);
      expect(region.top).toBeCloseTo(1.8);
    });
  });

  describe("recentre", () => {
    it("moves the region so the given point becomes the centre", () => {
      const region = new Region();
      setSquareRegion(region);

      region.recentre(1.5, 1.5);

      expect(region.centreX).toBeCloseTo(1.5);
      expect(region.centreY).toBeCloseTo(1.5);
      expect(region.width).toBe(2);
      expect(region.height).toBe(2);
    });
  });

  describe("mouseToRegion", () => {
    it("maps canvas corners to region corners", () => {
      const region = new Region();
      setSquareRegion(region);
      const canvas = { width: 800, height: 600 };

      expect(region.mouseToRegion(canvas, 0, 0)).toEqual({
        regionMouseX: 0,
        regionMouseY: 0,
      });
      expect(region.mouseToRegion(canvas, 800, 600)).toEqual({
        regionMouseX: 2,
        regionMouseY: 2,
      });
    });

    it("maps the canvas centre to the region centre", () => {
      const region = new Region();
      setSquareRegion(region);
      const canvas = { width: 800, height: 600 };

      const { regionMouseX, regionMouseY } = region.mouseToRegion(canvas, 400, 300);

      expect(regionMouseX).toBeCloseTo(1);
      expect(regionMouseY).toBeCloseTo(1);
    });
  });
});
