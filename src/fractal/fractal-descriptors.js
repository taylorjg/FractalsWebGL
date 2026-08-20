export const FRACTAL_KIND = {
  ESCAPE_TIME: "escape-time",
  IFS: "ifs",
};

export const COLOUR_MODE = {
  COLOUR_MAP: "colour-map",
  FIXED: "fixed",
};

export const ALT_CLICK_ACTION = {
  TO_JULIA_WITH_PICK: "to-julia-with-pick",
  TO_FRACTAL: "to-fractal",
};

export const MIN_ITERATIONS = 16;

const ESCAPE_TIME_ITERATIONS = {
  min: MIN_ITERATIONS,
  default: 128,
  max: 4096,
  step: 16,
  controlLabel: "Max Iterations",
  summarySuffix: "",
};

const BARNSLEY_ITERATIONS = {
  min: MIN_ITERATIONS,
  default: 16384,
  max: 65536,
  step: 4096,
  controlLabel: "IFS Steps",
  summarySuffix: " steps",
};

export const FRACTAL_DESCRIPTORS = [
  {
    id: 0,
    name: "Mandelbrot",
    kind: FRACTAL_KIND.ESCAPE_TIME,
    shaderKey: "mandelbrot",
    home: {
      juliaConstant: { x: 0, y: 0 },
      colourMapId: 0,
      regionBottomLeft: { x: -2.25, y: -1.5 },
      regionTopRight: { x: 0.75, y: 1.5 },
      maxIterations: ESCAPE_TIME_ITERATIONS.default,
    },
    iterations: ESCAPE_TIME_ITERATIONS,
    view: {
      flipPanY: false,
      reflectRegionY: false,
      refPixelSize: null,
    },
    colouring: {
      mode: COLOUR_MODE.COLOUR_MAP,
      defaultColourMapId: 0,
    },
    features: {
      smoothColouring: true,
      juliaConstant: false,
      showJuliaConstantInSummary: false,
      colourMapCycle: true,
      autoMode: true,
      interestScoring: true,
    },
    altClick: {
      action: ALT_CLICK_ACTION.TO_JULIA_WITH_PICK,
    },
  },
  {
    id: 1,
    name: "Julia",
    kind: FRACTAL_KIND.ESCAPE_TIME,
    shaderKey: "julia",
    home: {
      juliaConstant: { x: -0.7, y: 0.27015 },
      colourMapId: 0,
      regionBottomLeft: { x: -1.5, y: -1.5 },
      regionTopRight: { x: 1.5, y: 1.5 },
      maxIterations: ESCAPE_TIME_ITERATIONS.default,
    },
    iterations: ESCAPE_TIME_ITERATIONS,
    view: {
      flipPanY: false,
      reflectRegionY: false,
      refPixelSize: null,
    },
    colouring: {
      mode: COLOUR_MODE.COLOUR_MAP,
      defaultColourMapId: 0,
    },
    features: {
      smoothColouring: true,
      juliaConstant: true,
      showJuliaConstantInSummary: true,
      colourMapCycle: true,
      autoMode: true,
      interestScoring: true,
    },
    altClick: {
      action: ALT_CLICK_ACTION.TO_FRACTAL,
      fractalSetId: 0,
    },
  },
  {
    id: 2,
    name: "Barnsley",
    kind: FRACTAL_KIND.IFS,
    shaderKey: "barnsley",
    home: {
      juliaConstant: { x: 0, y: 0 },
      colourMapId: 0,
      regionBottomLeft: { x: -2.5, y: 0 },
      regionTopRight: { x: 2.5, y: 10 },
      maxIterations: BARNSLEY_ITERATIONS.default,
    },
    iterations: BARNSLEY_ITERATIONS,
    view: {
      flipPanY: true,
      reflectRegionY: true,
      refPixelSize: 10 / 1080,
    },
    colouring: {
      mode: COLOUR_MODE.FIXED,
      background: [0.11, 0.16, 0.14],
      foreground: [0.35, 0.78, 0.38],
      toneCurve: { logBase: 8, gamma: 0.9 },
    },
    features: {
      smoothColouring: false,
      juliaConstant: false,
      showJuliaConstantInSummary: false,
      colourMapCycle: true,
      autoMode: false,
      interestScoring: false,
    },
    altClick: {
      action: ALT_CLICK_ACTION.TO_FRACTAL,
      fractalSetId: 0,
    },
  },
];

const fractalById = new Map(
  FRACTAL_DESCRIPTORS.map((descriptor) => [descriptor.id, descriptor])
);

export const FRACTAL_SET_IDS = FRACTAL_DESCRIPTORS.map(
  (descriptor) => descriptor.id
);

export const FRACTAL_SET_ID_MANDELBROT = 0;
export const FRACTAL_SET_ID_JULIA = 1;
export const FRACTAL_SET_ID_BARNSLEY = 2;

export const getFractal = (fractalSetId) =>
  fractalById.get(fractalSetId) ?? fractalById.get(FRACTAL_SET_ID_MANDELBROT);

export const getFractalIds = () => FRACTAL_SET_IDS;

export const cycleFractalSetId = (fractalSetId) => {
  const index = FRACTAL_SET_IDS.indexOf(fractalSetId);
  const nextIndex = index >= 0 ? (index + 1) % FRACTAL_SET_IDS.length : 0;
  return FRACTAL_SET_IDS[nextIndex];
};

export const buildHomeBookmark = (descriptor) => ({
  fractalSetId: descriptor.id,
  juliaConstant: { ...descriptor.home.juliaConstant },
  colourMapId: descriptor.home.colourMapId,
  regionBottomLeft: { ...descriptor.home.regionBottomLeft },
  regionTopRight: { ...descriptor.home.regionTopRight },
  maxIterations: descriptor.home.maxIterations,
});

export const getHomeBookmark = (fractalSetId) =>
  buildHomeBookmark(getFractal(fractalSetId));

export const getMinIterations = (fractalSetId) =>
  getFractal(fractalSetId).iterations.min;

export const getMaxIterations = (fractalSetId) =>
  getFractal(fractalSetId).iterations.max;

export const getIterationDelta = (fractalSetId) =>
  getFractal(fractalSetId).iterations.step;

export const getIterationControlLabel = (fractalSetId) =>
  getFractal(fractalSetId).iterations.controlLabel;

export const formatIterationSummary = (fractalSetId, maxIterations) =>
  `${maxIterations}${getFractal(fractalSetId).iterations.summarySuffix}`;

export const isEscapeTimeFractal = (fractalSetId) =>
  getFractal(fractalSetId).kind === FRACTAL_KIND.ESCAPE_TIME;

export const supportsSmoothColouring = (fractalSetId) =>
  getFractal(fractalSetId).features.smoothColouring;

export const supportsJuliaConstant = (fractalSetId) =>
  getFractal(fractalSetId).features.juliaConstant;

export const showJuliaConstantInSummary = (fractalSetId) =>
  getFractal(fractalSetId).features.showJuliaConstantInSummary;

export const supportsInterestScoring = (fractalSetId) =>
  getFractal(fractalSetId).features.interestScoring;

export const shouldFlipPanY = (fractalSetId) =>
  getFractal(fractalSetId).view.flipPanY;

export const HOME_BOOKMARK = buildHomeBookmark(getFractal(FRACTAL_SET_ID_MANDELBROT));
export const JULIA_HOME_BOOKMARK = buildHomeBookmark(getFractal(FRACTAL_SET_ID_JULIA));
export const BARNSLEY_HOME_BOOKMARK = buildHomeBookmark(
  getFractal(FRACTAL_SET_ID_BARNSLEY)
);

export const INITIAL_ITERATIONS = ESCAPE_TIME_ITERATIONS.default;
export const MAX_ITERATIONS_MANUAL = ESCAPE_TIME_ITERATIONS.max;
export const MAX_ITERATIONS_BARNSLEY = BARNSLEY_ITERATIONS.max;
export const DELTA_ITERATIONS = ESCAPE_TIME_ITERATIONS.step;
export const DELTA_ITERATIONS_BARNSLEY = BARNSLEY_ITERATIONS.step;
export const BARNSLEY_INITIAL_ITERATIONS = BARNSLEY_ITERATIONS.default;
