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
  const canvas = document.getElementById("canvas");
  const previewPanel = document.getElementById("preview-panel");
  const previewInitialCanvas = document.getElementById("preview-initial");
  const previewFinalCanvas = document.getElementById("preview-final");

  const isInterestingConfiguration = (configuration, sampleWidth, sampleHeight, type) => {
    const returnIterationFlag = true;
    const pixels = renderThumbnail(sampleWidth, sampleHeight, configuration, returnIterationFlag);
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
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const aspectRatio = canvasWidth / canvasHeight;
    const region = new Region();
    region.set(initialConfiguration.regionBottomLeft, initialConfiguration.regionTopRight);
    region.adjustAspectRatio(canvas.clientWidth, canvas.clientHeight);
    initialConfiguration.regionBottomLeft = region.bottomLeft;
    initialConfiguration.regionTopRight = region.topRight;
    const sampleWidth = SAMPLE_SIZE;
    const sampleHeight = Math.round(SAMPLE_SIZE / aspectRatio);
    if (isInterestingConfiguration(initialConfiguration, sampleWidth, sampleHeight, "initial")) {
      const finalConfiguration = computeFinalConfiguration(initialConfiguration, seconds);
      if (isInterestingConfiguration(finalConfiguration, sampleWidth, sampleHeight, "final")) {
        if (preview) {
          previewPanel.style.visibility = "visible";
          const previewInitialPixels = renderThumbnail(
            sampleWidth,
            sampleHeight,
            initialConfiguration
          );
          const previewFinalPixels = renderThumbnail(sampleWidth, sampleHeight, finalConfiguration);
          U.drawThumbnail(previewInitialPixels, previewInitialCanvas, sampleWidth, sampleHeight);
          U.drawThumbnail(previewFinalPixels, previewFinalCanvas, sampleWidth, sampleHeight);
        }
        return initialConfiguration;
      }
    }
  };

  return {
    chooseConfiguration,
  };
};
