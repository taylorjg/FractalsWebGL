export const INITIAL_ITERATIONS = 128;
export const MIN_ITERATIONS = 16;
export const MAX_ITERATIONS_MANUAL = 4096;
export const MAX_ITERATIONS_BARNSLEY = 65536;
export const DELTA_ITERATIONS = 16;
export const DELTA_ITERATIONS_BARNSLEY = 4096;
export const FRACTAL_SET_ID_MANDELBROT = 0;
export const FRACTAL_SET_ID_JULIA = 1;
export const FRACTAL_SET_ID_BARNSLEY = 2;

export const FRACTAL_SET_IDS = [
  FRACTAL_SET_ID_MANDELBROT,
  FRACTAL_SET_ID_JULIA,
  FRACTAL_SET_ID_BARNSLEY,
];

export const BARNSLEY_INITIAL_ITERATIONS = 16384;

export const isEscapeTimeFractal = (fractalSetId) =>
  fractalSetId === FRACTAL_SET_ID_MANDELBROT ||
  fractalSetId === FRACTAL_SET_ID_JULIA;

export const isBarnsleyFractal = (fractalSetId) =>
  fractalSetId === FRACTAL_SET_ID_BARNSLEY;

export const getMaxIterations = (fractalSetId) =>
  isBarnsleyFractal(fractalSetId)
    ? MAX_ITERATIONS_BARNSLEY
    : MAX_ITERATIONS_MANUAL;

export const getIterationDelta = (fractalSetId) =>
  isBarnsleyFractal(fractalSetId)
    ? DELTA_ITERATIONS_BARNSLEY
    : DELTA_ITERATIONS;

export const cycleFractalSetId = (fractalSetId) => {
  const index = FRACTAL_SET_IDS.indexOf(fractalSetId);
  const nextIndex = index >= 0 ? (index + 1) % FRACTAL_SET_IDS.length : 0;
  return FRACTAL_SET_IDS[nextIndex];
};

export const getHomeBookmark = (fractalSetId) => {
  if (fractalSetId === FRACTAL_SET_ID_BARNSLEY) {
    return BARNSLEY_HOME_BOOKMARK;
  }
  if (fractalSetId === FRACTAL_SET_ID_JULIA) {
    return JULIA_HOME_BOOKMARK;
  }
  return HOME_BOOKMARK;
};

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
  "freesurface-blue",
  "freesurface-red",
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

export const JULIA_HOME_BOOKMARK = {
  fractalSetId: FRACTAL_SET_ID_JULIA,
  juliaConstant: { x: -0.7, y: 0.27015 },
  colourMapId: 0,
  regionBottomLeft: { x: -1.5, y: -1.5 },
  regionTopRight: { x: 1.5, y: 1.5 },
  maxIterations: INITIAL_ITERATIONS,
};

export const BARNSLEY_HOME_BOOKMARK = {
  fractalSetId: FRACTAL_SET_ID_BARNSLEY,
  juliaConstant: { x: 0, y: 0 },
  colourMapId: 0,
  regionBottomLeft: { x: -2.5, y: 0 },
  regionTopRight: { x: 2.5, y: 10 },
  maxIterations: BARNSLEY_INITIAL_ITERATIONS,
};
