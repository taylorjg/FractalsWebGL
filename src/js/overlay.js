const RUBBER_BAND_RECT_THICKNESS = 2;
const RUBBER_BAND_RECT_COLOUR = "#FFFFFF80";

export const configureOverlay = () => {
  const overlay = document.getElementById("overlay");
  const ctx2d = overlay.getContext("2d");

  const setSize = (width, height) => {
    overlay.width = width;
    overlay.height = height;
  };

  const clearSelectionRegion = () => {
    ctx2d.clearRect(0, 0, ctx2d.canvas.width, ctx2d.canvas.height);
  };

  const drawSelectionRegion = (x1, y1, x2, y2) => {
    clearSelectionRegion();
    const top = Math.max(y1, y2);
    const bottom = Math.min(y1, y2);
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const width = right - left;
    const height = top - bottom;
    ctx2d.lineWidth = RUBBER_BAND_RECT_THICKNESS;
    ctx2d.strokeStyle = RUBBER_BAND_RECT_COLOUR;
    ctx2d.strokeRect(left, bottom, width, height);
  };

  return { setSize, clearSelectionRegion, drawSelectionRegion };
};
