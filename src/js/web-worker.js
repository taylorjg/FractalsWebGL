import registerPromiseWorker from "promise-worker/register";
import * as C from "./constants";
import * as U from "./utils";

const evaluatePoint = (configuration, point) => {
  let z = { x: 0, y: 0 };
  const c = point;
  let iteration = 0;
  while (iteration < configuration.maxIterations) {
    if (z.x * z.x + z.y * z.y >= 4) break;
    const zSquared = { x: z.x * z.x - z.y * z.y, y: 2.0 * z.x * z.y };
    z = { x: zSquared.x + c.x, y: zSquared.y + c.y };
    iteration += 1;
  }
  return iteration;
};

const evaluatePoints = (configuration, gridSize) => {
  const w = configuration.regionTopRight.x - configuration.regionBottomLeft.x;
  const h = configuration.regionTopRight.y - configuration.regionBottomLeft.y;
  const dx = w / (gridSize + 1);
  const dy = h / (gridSize + 1);
  const values = [];
  for (let row = 1; row <= gridSize; row++) {
    const y = configuration.regionBottomLeft.y + row * dy;
    for (let col = 1; col <= gridSize; col++) {
      const x = configuration.regionBottomLeft.x + col * dx;
      const point = { x, y };
      const value = evaluatePoint(configuration, point);
      values.push(value);
    }
  }
  return values;
};

const isInteresting = (configuration) => {
  const gridSize = 12;
  const values = evaluatePoints(configuration, gridSize);
  const factor = U.randomFloat(0.4, 0.7);
  return new Set(values).size >= values.length * factor;
};

const createRandomConfiguration = (fractalSetIds, colourMapIds) => {
  const fractalSetId = U.randomElement(fractalSetIds);
  const colourMapId = U.randomElement(colourMapIds);
  const cx = U.randomFloat(-2, 0.75);
  const cy = U.randomFloat(-1.5, 1.5);
  const sz = U.randomFloat(0.01, 0.5);
  const maxIterations = U.randomInt(C.MIN_ITERATIONS, C.MAX_ITERATIONS_AUTO);
  const panSpeedX = U.randomPanSpeed();
  const panSpeedY = U.randomPanSpeed();
  const zoomSpeed = U.randomZoomSpeed();

  return {
    fractalSetId,
    juliaConstant: { x: cx, y: cy },
    colourMapId,
    regionBottomLeft: { x: cx - sz, y: cy - sz },
    regionTopRight: { x: cx + sz, y: cy + sz },
    maxIterations,
    panSpeedX,
    panSpeedY,
    zoomSpeed,
  };
};

const onChooseConfiguration = (fractalSetIds, colourMapIds) => {
  for (;;) {
    const configuration = createRandomConfiguration(
      fractalSetIds,
      colourMapIds
    );
    if (isInteresting(configuration)) {
      // console.log("[onChooseConfiguration]", "configuration:", JSON.stringify(configuration, null, 2));
      return configuration;
    }
  }
};

const onUnknownMessage = (message) => {
  console.log(`Unknown message: ${JSON.stringify(message)}`);
};

const processMessage = (message) => {
  // console.log("[processMessage]", "message.type:", message.type);
  switch (message.type) {
    case "chooseConfiguration":
      return onChooseConfiguration(message.fractalSetIds, message.colourMapIds);
    default:
      return onUnknownMessage(message);
  }
};

registerPromiseWorker(processMessage);
