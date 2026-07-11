export const INTEREST_THRESHOLDS = {
  MIN_BOUNDARY_FRACTION: 0.25,
  MAX_DOMINANT_BIN_FRACTION: 0.5,
  MIN_NORMALIZED_ENTROPY: 0.38,
  MIN_UNIQUE_ITERATIONS: 18,
  MIN_EDGE_DENSITY: 0.12,
};

export const FINAL_INTEREST_THRESHOLDS = {
  MIN_BOUNDARY_FRACTION: 0.32,
  MAX_DOMINANT_BIN_FRACTION: 0.42,
  MIN_NORMALIZED_ENTROPY: 0.42,
  MIN_UNIQUE_ITERATIONS: 18,
  MIN_EDGE_DENSITY: 0.14,
  MAX_EXTERIOR_FRACTION: 0.4,
  MAX_INTERIOR_FRACTION: 0.4,
};

export const decodeIteration = (pixels, pixelIndex) => {
  const offset = pixelIndex * 4;
  return pixels[offset] + (pixels[offset + 1] << 8);
};

export const encodeIterationPixel = (iteration) => {
  const lo = iteration & 0xff;
  const hi = (iteration & 0xff00) >> 8;
  return [lo, hi, 0, 255];
};

export const analyzeIterationPixels = (pixels, maxIterations, width, height) => {
  const pixelCount = pixels.length / 4;
  const histogram = new Map();
  let boundaryCount = 0;
  let exteriorCount = 0;
  let interiorCount = 0;

  const iterationAt = (x, y) => decodeIteration(pixels, y * width + x);

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex++) {
    const iteration = decodeIteration(pixels, pixelIndex);
    histogram.set(iteration, (histogram.get(iteration) ?? 0) + 1);
    if (iteration === 0) {
      exteriorCount++;
    } else if (iteration >= maxIterations) {
      interiorCount++;
    } else {
      boundaryCount++;
    }
  }

  let edgeCount = 0;
  let edgeComparisons = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const iteration = iterationAt(x, y);
      if (x + 1 < width) {
        edgeComparisons++;
        if (iterationAt(x + 1, y) !== iteration) {
          edgeCount++;
        }
      }
      if (y + 1 < height) {
        edgeComparisons++;
        if (iterationAt(x, y + 1) !== iteration) {
          edgeCount++;
        }
      }
    }
  }

  const uniqueIterations = histogram.size;
  const boundaryFraction = boundaryCount / pixelCount;
  const exteriorFraction = exteriorCount / pixelCount;
  const interiorFraction = interiorCount / pixelCount;
  const edgeDensity = edgeComparisons > 0 ? edgeCount / edgeComparisons : 0;

  let maxBinCount = 0;
  let entropy = 0;
  for (const count of histogram.values()) {
    maxBinCount = Math.max(maxBinCount, count);
    const probability = count / pixelCount;
    entropy -= probability * Math.log2(probability);
  }

  const maxBinFraction = maxBinCount / pixelCount;
  const normalizedEntropy = uniqueIterations > 1 ? entropy / Math.log2(uniqueIterations) : 0;

  return {
    uniqueIterations,
    boundaryFraction,
    exteriorFraction,
    interiorFraction,
    edgeDensity,
    maxBinFraction,
    normalizedEntropy,
  };
};

export const scoreDistribution = (analysis) => {
  const balance =
    1 - Math.abs(analysis.exteriorFraction - 0.12) - Math.abs(analysis.interiorFraction - 0.12);

  return (
    analysis.boundaryFraction * 2 +
    analysis.normalizedEntropy * 1.5 +
    analysis.edgeDensity * 2.5 +
    (1 - analysis.maxBinFraction) * 0.5 +
    Math.max(0, balance) * 0.5
  );
};

export const scoreCandidate = (initialAnalysis, finalAnalysis) =>
  scoreDistribution(initialAnalysis) * 0.35 + scoreDistribution(finalAnalysis) * 0.65;

export const isInterestingDistribution = (analysis, thresholds = INTEREST_THRESHOLDS) => {
  const passesCoreChecks =
    analysis.boundaryFraction >= thresholds.MIN_BOUNDARY_FRACTION &&
    analysis.maxBinFraction <= thresholds.MAX_DOMINANT_BIN_FRACTION &&
    analysis.normalizedEntropy >= thresholds.MIN_NORMALIZED_ENTROPY &&
    analysis.uniqueIterations >= thresholds.MIN_UNIQUE_ITERATIONS &&
    analysis.edgeDensity >= (thresholds.MIN_EDGE_DENSITY ?? 0);

  if (!passesCoreChecks) {
    return false;
  }

  if (
    thresholds.MAX_EXTERIOR_FRACTION !== undefined &&
    analysis.exteriorFraction > thresholds.MAX_EXTERIOR_FRACTION
  ) {
    return false;
  }

  if (
    thresholds.MAX_INTERIOR_FRACTION !== undefined &&
    analysis.interiorFraction > thresholds.MAX_INTERIOR_FRACTION
  ) {
    return false;
  }

  return true;
};
