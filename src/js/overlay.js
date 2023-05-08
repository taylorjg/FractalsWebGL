import * as C from "./constants";

const RUBBER_BAND_RECT_THICKNESS = 2;
const RUBBER_BAND_RECT_COLOUR = "#FFFFFF80";

export const configureOverlay = ({ fractalSets, colourMaps }) => {
  const canvasOverlay = document.getElementById("canvasOverlay");
  const canvasOverlayCtx2d = canvasOverlay.getContext("2d");

  const divOverlay = document.getElementById("divOverlay");
  const configurationSummary = document.getElementById("configurationSummary");

  const setSize = (width, height) => {
    canvasOverlay.width = width;
    canvasOverlay.height = height;
    divOverlay.width = width;
    divOverlay.height = height;
  };

  const drawSelectionRegion = (x1, y1, x2, y2) => {
    clearSelectionRegion();
    const top = Math.max(y1, y2);
    const bottom = Math.min(y1, y2);
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const width = right - left;
    const height = top - bottom;
    canvasOverlayCtx2d.lineWidth = RUBBER_BAND_RECT_THICKNESS;
    canvasOverlayCtx2d.strokeStyle = RUBBER_BAND_RECT_COLOUR;
    canvasOverlayCtx2d.strokeRect(left, bottom, width, height);
  };

  const clearSelectionRegion = () => {
    canvasOverlayCtx2d.clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
  };

  const formatCoords = ({ x, y }) => {
    return `(${x}, ${y})`;
  };

  const showConfigurationSummary = (configuration) => {
    const juliaConstant =
      configuration.fractalSetId === C.FRACTAL_SET_ID_JULIA
        ? formatCoords(configuration.juliaConstant)
        : "";
    const bottomLeftFormatted = formatCoords(configuration.regionBottomLeft);
    const topRightFormatted = formatCoords(configuration.regionTopRight);
    const region = `${bottomLeftFormatted}, ${topRightFormatted}`;
    const bits = [
      fractalSets.get(configuration.fractalSetId)?.name ?? "unknown",
      juliaConstant,
      region,
      colourMaps.get(configuration.colourMapId)?.name ?? "unknown",
      configuration.maxIterations,
    ];
    configurationSummary.innerText = bits.filter(Boolean).join(" | ");
    configurationSummary.style.display = "flex";
  };

  const hideConfigurationSummary = () => {
    configurationSummary.style.display = "none";
  };

  return {
    setSize,
    drawSelectionRegion,
    clearSelectionRegion,
    showConfigurationSummary,
    hideConfigurationSummary,
  };
};
