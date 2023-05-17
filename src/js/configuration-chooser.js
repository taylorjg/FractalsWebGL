import { Region } from "./region";
import * as C from "./constants";
import * as U from "./utils";

export const configureConfigurationChooser = ({ renderThumbnail, fractalSetIds, colourMapIds }) => {
  const isInteresting = (configuration) => {
    const SIZE = 8;
    const MIN_REQUIRED_PERCENT_UNIQUE_VALUES = 60;
    const pixels = renderThumbnail(SIZE, configuration);
    const values = new Set();
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const v = r + (g << 8) + (b << 16);
      values.add(v);
    }
    const numUniqueValues = values.size;
    return numUniqueValues >= (SIZE * SIZE * MIN_REQUIRED_PERCENT_UNIQUE_VALUES) / 100;
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
    const maxIterations = U.randomInt(C.INITIAL_ITERATIONS, C.MAX_ITERATIONS_MANUAL);
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
