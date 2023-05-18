import { Region } from "./region";
import * as U from "./utils";

const SAMPLE_SIZE = 64;
const MIN_REQUIRED_PERCENT = 60;
const MAX_FPS = 60;

export const configureConfigurationChooser = ({
  renderThumbnail,
  fractalSetIds,
  colourMapIds,
  preview,
}) => {
  const previewInitialCanvas = document.getElementById("preview-initial");
  const previewFinalCanvas = document.getElementById("preview-final");

  const isInterestingConfiguration = (configuration, type) => {
    const pixels = renderThumbnail(SAMPLE_SIZE, configuration, true /* returnIteration */);
    const iterationValues = new Set();
    for (let i = 0; i < pixels.length; i += 4) {
      const lo = pixels[i];
      const hi = pixels[i + 1];
      const iteration = lo + (hi << 8);
      iterationValues.add(iteration);
    }
    const uniqueIterationValues = Array.from(iterationValues);
    const numUniqueIterationValues = uniqueIterationValues.length;
    const maxIterations = configuration.maxIterations;
    const threshold = maxIterations * (MIN_REQUIRED_PERCENT / 100);
    const result = numUniqueIterationValues >= threshold;
    if (result) {
      const dataToLog = {
        type,
        numUniqueIterationValues,
        threshold,
        maxIterations,
      };
      console.log("[configureConfigurationChooser]", JSON.stringify(dataToLog, null, 2));
    }
    return result;
  };

  const computeFinalConfiguration = (configuration, seconds) => {
    const frameCount = seconds * MAX_FPS;
    const region = new Region();
    region.set(configuration.regionBottomLeft, configuration.regionTopRight);
    for (let i = 0; i < frameCount; i++) {
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
    const maxIterations = U.randomInt(32, 1024);
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
    const initialConfiguration = createRandomConfiguration(fractalSetIds, colourMapIds);
    if (isInterestingConfiguration(initialConfiguration, "initial")) {
      const finalConfiguration = computeFinalConfiguration(initialConfiguration, seconds);
      if (isInterestingConfiguration(finalConfiguration, "final")) {
        if (preview) {
          const previewInitialPixels = renderThumbnail(SAMPLE_SIZE, initialConfiguration);
          const previewFinalPixels = renderThumbnail(SAMPLE_SIZE, finalConfiguration);
          U.drawThumbnail(previewInitialPixels, previewInitialCanvas, SAMPLE_SIZE);
          U.drawThumbnail(previewFinalPixels, previewFinalCanvas, SAMPLE_SIZE);
        }
        return initialConfiguration;
      }
    }
  };

  return {
    chooseConfiguration,
  };
};
