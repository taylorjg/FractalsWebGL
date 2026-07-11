import * as C from "@app/fractal/constants";
import { Region } from "@app/fractal/region";
import * as U from "@app/fractal/utils";

const VIVID_COLOUR_MAP_NAMES = new Set([
  "hsv",
  "hot",
  "rainbow",
  "electric",
  "viridis",
  "inferno",
  "magma",
  "plasma",
  "picnic",
  "portland",
]);

export const MANDELBROT_HOTSPOTS = [
  { centreX: -0.743643887037151, centreY: 0.13182590420533, halfWidth: 0.05 },
  { centreX: -1.769110375463767, centreY: 0.009020801064, halfWidth: 0.02 },
  { centreX: -0.761574, centreY: -0.0847596, halfWidth: 0.015 },
  { centreX: 0.2817179215, centreY: 0.577105291, halfWidth: 0.04 },
  { centreX: -0.235125, centreY: 0.827215, halfWidth: 0.025 },
  { centreX: -0.16, centreY: 1.0405, halfWidth: 0.03 },
  { centreX: -0.7269, centreY: 0.1889, halfWidth: 0.02 },
  { centreX: -0.215, centreY: -0.695, halfWidth: 0.002 },
];

export const JULIA_CONSTANTS = [
  { x: -0.7, y: 0.27015 },
  { x: -0.8, y: 0.156 },
  { x: -0.4, y: 0.6 },
  { x: 0.285, y: 0.01 },
  { x: -0.7269, y: 0.1889 },
  { x: -0.123, y: 0.745 },
  { x: 0.355, y: 0.355 },
];

export const getVividColourMapIds = () =>
  C.COLOUR_MAP_NAMES.flatMap((name, id) => (VIVID_COLOUR_MAP_NAMES.has(name) ? [id] : []));

// Smallest allowed half-width for auto mode (~deepest zoom in).
export const AUTO_MIN_HALF_WIDTH = 0.001;

export const clampAutoHalfWidth = (halfWidth) =>
  Math.max(AUTO_MIN_HALF_WIDTH, halfWidth);

export const halfWidthFromConfiguration = (configuration) => {
  const { regionBottomLeft, regionTopRight } = configuration;
  return (regionTopRight.x - regionBottomLeft.x) / 2;
};

export const iterationsForZoomDepth = (halfWidth) => {
  const depth = Math.log10(1 / Math.max(halfWidth, AUTO_MIN_HALF_WIDTH));
  return U.clamp(128, 2048, Math.round(100 + depth * 120));
};

export const pickAutoColourMapId = (colourMapIds) => {
  const vividIds = getVividColourMapIds().filter((id) => colourMapIds.includes(id));
  if (vividIds.length > 0 && Math.random() < 0.85) {
    return U.randomElement(vividIds);
  }
  return U.randomElement(colourMapIds);
};

const createRegionFromCentre = (centreX, centreY, halfWidth, halfHeight = halfWidth) => ({
  regionBottomLeft: { x: centreX - halfWidth, y: centreY - halfHeight },
  regionTopRight: { x: centreX + halfWidth, y: centreY + halfHeight },
});

export const createAutoMotion = ({ maxPanSpeed, minZoomSpeed, maxZoomSpeed }) => {
  const zoomSpeed = U.randomFloat(minZoomSpeed, maxZoomSpeed);
  const panMagnitude = U.randomFloat(0, maxPanSpeed * 0.65);
  const panAngle = U.randomFloat(0, Math.PI * 2);

  return {
    panSpeedX: Math.cos(panAngle) * panMagnitude,
    panSpeedY: Math.sin(panAngle) * panMagnitude,
    zoomSpeed,
  };
};

export const createConfigurationFromRegion = ({
  fractalSetId,
  juliaConstant,
  centreX,
  centreY,
  halfWidth,
  colourMapId,
  motion,
}) => {
  const clampedHalfWidth = clampAutoHalfWidth(halfWidth);

  return {
    fractalSetId,
    juliaConstant,
    colourMapId,
    maxIterations: iterationsForZoomDepth(clampedHalfWidth),
    ...motion,
    ...createRegionFromCentre(centreX, centreY, clampedHalfWidth),
  };
};

export const createHotspotMandelbrotConfiguration = (colourMapId, motion) => {
  const hotspot = U.randomElement(MANDELBROT_HOTSPOTS);
  const jitterScale = hotspot.halfWidth * 0.15;
  const centreX = hotspot.centreX + U.randomFloat(-jitterScale, jitterScale);
  const centreY = hotspot.centreY + U.randomFloat(-jitterScale, jitterScale);
  const halfWidth = U.randomLogUniform(hotspot.halfWidth * 0.02, hotspot.halfWidth * 0.2);

  return createConfigurationFromRegion({
    fractalSetId: C.FRACTAL_SET_ID_MANDELBROT,
    juliaConstant: { x: 0, y: 0 },
    centreX,
    centreY,
    halfWidth,
    colourMapId,
    motion,
  });
};

export const createDeepZoomSeedConfiguration = (colourMapId, motion) => {
  const seed = C.INITIAL_BOOKMARK;
  const region = new Region();
  region.set(seed.regionBottomLeft, seed.regionTopRight);
  region.panX(U.randomFloat(-15, 15));
  region.panY(U.randomFloat(-15, 15));
  region.zoom(U.randomFloat(20, 50));

  const halfWidth = clampAutoHalfWidth(region.width / 2);

  return {
    fractalSetId: seed.fractalSetId,
    juliaConstant: { ...seed.juliaConstant },
    colourMapId,
    maxIterations: iterationsForZoomDepth(halfWidth),
    ...motion,
    ...createRegionFromCentre(region.centreX, region.centreY, halfWidth),
  };
};

export const createJuliaConfiguration = (colourMapId, motion) => {
  const seed = U.randomElement(JULIA_CONSTANTS);
  const juliaConstant = {
    x: seed.x + U.randomFloat(-0.03, 0.03),
    y: seed.y + U.randomFloat(-0.03, 0.03),
  };
  const halfWidth = U.randomLogUniform(0.05, 0.8);

  return createConfigurationFromRegion({
    fractalSetId: C.FRACTAL_SET_ID_JULIA,
    juliaConstant,
    centreX: 0,
    centreY: 0,
    halfWidth,
    colourMapId,
    motion,
  });
};

export const createExploratoryMandelbrotConfiguration = (colourMapId, motion) => {
  const centreX = U.randomFloat(-1.2, 0.4);
  const centreY = U.randomFloat(-1.0, 1.0);
  const halfWidth = U.randomLogUniform(0.001, 0.015);

  return createConfigurationFromRegion({
    fractalSetId: C.FRACTAL_SET_ID_MANDELBROT,
    juliaConstant: { x: 0, y: 0 },
    centreX,
    centreY,
    halfWidth,
    colourMapId,
    motion,
  });
};

export const createRandomAutoConfiguration = (colourMapIds, motionOptions) => {
  const colourMapId = pickAutoColourMapId(colourMapIds);
  const motion = createAutoMotion(motionOptions);
  const roll = Math.random();

  if (roll < 0.55) {
    return createHotspotMandelbrotConfiguration(colourMapId, motion);
  }
  if (roll < 0.8) {
    return createDeepZoomSeedConfiguration(colourMapId, motion);
  }
  if (roll < 0.92) {
    return createJuliaConfiguration(colourMapId, motion);
  }
  return createExploratoryMandelbrotConfiguration(colourMapId, motion);
};
