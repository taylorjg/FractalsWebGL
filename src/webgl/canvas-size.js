import { performRegionUpdate } from "./configuration";

export const setCanvasAndViewportSize = (ctx, explicitWidth, explicitHeight) => {
  const { canvas, overlay, gl, region } = ctx;
  const width = explicitWidth ?? canvas.clientWidth;
  const height = explicitHeight ?? canvas.clientHeight;

  if (!explicitWidth && !explicitHeight) {
    canvas.width = width;
    canvas.height = height;
    overlay.setSize(width, height);
  }

  gl.viewport(0, 0, width, height);

  performRegionUpdate(ctx, () => {
    region.adjustAspectRatio(width, height);
  });
};

export const createWindowResizeHandler = (ctx, render) => () => {
  setCanvasAndViewportSize(ctx);
  render();
};
