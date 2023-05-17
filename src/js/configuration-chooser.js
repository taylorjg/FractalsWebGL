import { Region } from "./region";
import * as C from "./constants";
import * as U from "./utils";

export const configureConfigurationChooser = ({ renderThumbnail, fractalSetIds, colourMapIds }) => {
  const isInteresting = (configuration) => {
    const SIZE = 16;
    const MIN_REQUIRED_PERCENT_UNIQUE_VALUES = 40;
    const pixels = renderThumbnail(SIZE, configuration, true /* returnIteration */);
    const iterationValues = new Set();
    for (let i = 0; i < pixels.length; i += 4) {
      const lo = pixels[i];
      const hi = pixels[i + 1];
      const iteration = lo + (hi << 8);
      iterationValues.add(iteration);
    }
    const numUniqueIterationValues = iterationValues.size;
    return numUniqueIterationValues >= (SIZE * SIZE * MIN_REQUIRED_PERCENT_UNIQUE_VALUES) / 100;
  };

  const calculateFinalConfiguration = (configuration, seconds) => {
    const MAX_FPS = 60;
    const FRAME_COUNT = seconds * MAX_FPS;
    const region = new Region();
    region.set(configuration.regionBottomLeft, configuration.regionTopRight);
    for (let i = 0; i < FRAME_COUNT; i++) {
      region.panX(configuration.panSpeedX);
      region.panY(configuration.panSpeedY);
      region.zoom(configuration.zoomSpeed);
    }
    return {
      ...configuration,
      regionBottomLeft: region.bottomLeft,
      regionTopRight: region.topRight,
    };
  };

  const createRandomConfiguration = () => {
    const fractalSetId = U.randomElement(fractalSetIds);
    const colourMapId = U.randomElement(colourMapIds);
    const cx = U.randomFloat(-2, 0.75);
    const cy = U.randomFloat(-1.5, 1.5);
    const sz = U.randomFloat(0.01, 0.5);
    const maxIterations = U.randomInt(32, 512);
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

  const chooseConfiguration = (seconds) => {
    for (;;) {
      const configuration = createRandomConfiguration(fractalSetIds, colourMapIds);
      if (isInteresting(configuration)) {
        const finalConfiguration = calculateFinalConfiguration(configuration, seconds);
        if (isInteresting(finalConfiguration)) {
          return configuration;
        }
      }
    }
  };

  return {
    chooseConfiguration,
  };
};
