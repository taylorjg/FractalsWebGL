import { Region } from "@app/fractal/region";
import { createRandomAutoConfiguration } from "@app/fractal/auto-seeds";
import {
  analyzeIterationPixels,
  FINAL_INTEREST_THRESHOLDS,
  INTEREST_THRESHOLDS,
  isInterestingDistribution,
  scoreCandidate,
} from "@app/fractal/configuration-interest";
import { drawThumbnail } from "@app/ui/thumbnail-canvas";

const SAMPLE_SIZE = 64;
const MAX_FPS = 60;
const CANDIDATES_PER_SEARCH = 2;
const MIN_ACCEPTABLE_SCORE = 1.35;
const AUTO_MOTION = {
  maxPanSpeed: 0.035,
  minZoomSpeed: 0.05,
  maxZoomSpeed: 0.12,
};

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

  const normalizeConfigurationRegion = (configuration) => {
    const region = new Region();
    region.set(configuration.regionBottomLeft, configuration.regionTopRight);
    region.adjustAspectRatio(canvas.clientWidth, canvas.clientHeight);
    return {
      ...configuration,
      regionBottomLeft: { ...region.bottomLeft },
      regionTopRight: { ...region.topRight },
    };
  };

  const analyzeConfiguration = (configuration, sampleWidth, sampleHeight, thresholds) => {
    const pixels = renderThumbnail(sampleWidth, sampleHeight, configuration, true);
    const analysis = analyzeIterationPixels(
      pixels,
      configuration.maxIterations,
      sampleWidth,
      sampleHeight
    );
    return {
      analysis,
      passes: isInterestingDistribution(analysis, thresholds),
    };
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

  const evaluateCandidate = (configuration, seconds, sampleWidth, sampleHeight) => {
    const initialConfiguration = normalizeConfigurationRegion(configuration);
    const initial = analyzeConfiguration(
      initialConfiguration,
      sampleWidth,
      sampleHeight,
      INTEREST_THRESHOLDS
    );
    if (!initial.passes) {
      return null;
    }

    const finalConfiguration = computeFinalConfiguration(initialConfiguration, seconds);
    const final = analyzeConfiguration(
      finalConfiguration,
      sampleWidth,
      sampleHeight,
      FINAL_INTEREST_THRESHOLDS
    );
    if (!final.passes) {
      return null;
    }

    const score = scoreCandidate(initial.analysis, final.analysis);
    return {
      configuration: initialConfiguration,
      finalConfiguration,
      score,
      initialAnalysis: initial.analysis,
      finalAnalysis: final.analysis,
    };
  };

  const chooseConfiguration = (seconds) => {
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const sampleWidth = SAMPLE_SIZE;
    const sampleHeight = Math.round(SAMPLE_SIZE / aspectRatio);

    let bestCandidate = null;
    for (let candidateIndex = 0; candidateIndex < CANDIDATES_PER_SEARCH; candidateIndex++) {
      const configuration = createRandomAutoConfiguration(colourMapIds, AUTO_MOTION);
      const candidate = evaluateCandidate(configuration, seconds, sampleWidth, sampleHeight);
      if (candidate && (!bestCandidate || candidate.score > bestCandidate.score)) {
        bestCandidate = candidate;
      }
    }

    if (!bestCandidate || bestCandidate.score < MIN_ACCEPTABLE_SCORE) {
      return undefined;
    }

    console.log(
      "[configureConfigurationChooser]",
      JSON.stringify(
        {
          score: bestCandidate.score,
          initial: bestCandidate.initialAnalysis,
          final: bestCandidate.finalAnalysis,
          maxIterations: bestCandidate.configuration.maxIterations,
        },
        null,
        2
      )
    );

    if (preview) {
      previewPanel.style.visibility = "visible";
      const previewInitialPixels = renderThumbnail(
        sampleWidth,
        sampleHeight,
        bestCandidate.configuration
      );
      const previewFinalPixels = renderThumbnail(
        sampleWidth,
        sampleHeight,
        bestCandidate.finalConfiguration
      );
      drawThumbnail(previewInitialPixels, previewInitialCanvas, sampleWidth, sampleHeight);
      drawThumbnail(previewFinalPixels, previewFinalCanvas, sampleWidth, sampleHeight);
    }

    return bestCandidate.configuration;
  };

  return {
    chooseConfiguration,
  };
};
