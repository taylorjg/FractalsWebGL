export const INITIAL_ITERATIONS = 128;
export const MIN_ITERATIONS = 16;
export const MAX_ITERATIONS_MANUAL = 4096;
export const MAX_ITERATIONS_AUTO = 256;
export const DELTA_ITERATIONS = 16;
export const FRACTAL_SET_ID_MANDELBROT = 0;
export const FRACTAL_SET_ID_JULIA = 1;

export const COLOUR_MAP_NAMES = [
  "jet",
  "hsv",
  "hot",
  "cool",
  "warm",
  "spring",
  "summer",
  "autumn",
  "winter",
  "bone",
  "copper",
  "greys",
  "YIOrRd",
  "bluered",
  "RdBu",
  "picnic",
  "rainbow",
  "portland",
  "blackbody",
  "earth",
  "electric",
  "viridis",
  "inferno",
  "magma",
  "plasma",
  "rainbow-soft",
  "bathymetry",
  "cdom",
  "chlorophyll",
  "density",
];

export const INITIAL_BOOKMARK = {
  fractalSetId: FRACTAL_SET_ID_MANDELBROT,
  juliaConstant: { x: 0, y: 0 },
  colourMapId: 0,
  regionBottomLeft: { x: -0.22, y: -0.7 },
  regionTopRight: { x: -0.21, y: -0.69 },
  maxIterations: INITIAL_ITERATIONS,
};

export const HOME_BOOKMARK = {
  fractalSetId: FRACTAL_SET_ID_MANDELBROT,
  juliaConstant: { x: 0, y: 0 },
  colourMapId: 0,
  regionBottomLeft: { x: -2.25, y: -1.5 },
  regionTopRight: { x: 0.75, y: 1.5 },
  maxIterations: INITIAL_ITERATIONS,
};
