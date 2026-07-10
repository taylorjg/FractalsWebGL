import { Gesture } from "@use-gesture/vanilla";
import * as C from "@app/fractal/constants";
import { makeConfigurationChanges, performRegionUpdate } from "@app/webgl/configuration";
import { setCanvasAndViewportSize } from "@app/webgl/canvas-size";

export const configurePointer = (ctx, { render }) => {
  const onDragStart = (e) => {
    if (e.metaKey) return;
    const [mouseX, mouseY] = e.initial;
    ctx.lastMousePt = { mouseX, mouseY };
  };

  const onDrag = (e) => {
    if (e.metaKey) return;
    performRegionUpdate(ctx, () => {
      const [mouseX, mouseY] = e.values;
      const mouseDeltaX = mouseX - ctx.lastMousePt.mouseX;
      const mouseDeltaY = mouseY - ctx.lastMousePt.mouseY;
      ctx.region.drag(ctx.canvas, mouseDeltaX, mouseDeltaY);
      ctx.lastMousePt = { mouseX, mouseY };
    });
    render();
  };

  const onDragEnd = (e) => {
    if (e.metaKey) return;
  };

  const onPinchStart = (e) => {
    const [mouseX, mouseY] = e.origin;
    const { regionMouseX: fixedX, regionMouseY: fixedY } = ctx.region.mouseToRegion(
      ctx.canvas,
      mouseX,
      mouseY
    );
    ctx.pinchMemo = {
      originalWidth: ctx.region.width,
      originalHeight: ctx.region.height,
      fixedX,
      fixedY,
      originalDeltaX: fixedX - ctx.region.left,
      originalDeltaY: fixedY - ctx.region.bottom,
    };
  };

  const onPinch = (e) => {
    performRegionUpdate(ctx, () => {
      const [scale] = e.movement;

      const newWidth = ctx.pinchMemo.originalWidth / scale;
      const newDeltaX = ctx.pinchMemo.originalDeltaX / scale;
      const newLeft = ctx.pinchMemo.fixedX - newDeltaX;
      const newRight = newLeft + newWidth;

      const newHeight = ctx.pinchMemo.originalHeight / scale;
      const newDeltaY = ctx.pinchMemo.originalDeltaY / scale;
      const newBottom = ctx.pinchMemo.fixedY - newDeltaY;
      const newTop = newBottom + newHeight;

      const bottomLeft = { x: newLeft, y: newBottom };
      const topRight = { x: newRight, y: newTop };
      ctx.region.set(bottomLeft, topRight);
    });
    render();
  };

  const onPinchEnd = () => {};

  const onCanvasMouseDownHandler = (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    const { regionMouseX, regionMouseY } = ctx.region.mouseToRegion(ctx.canvas, mouseX, mouseY);

    if (e.metaKey) {
      ctx.selectingRegion = true;
      ctx.selectingRegionInitialPt = { mouseX, mouseY };
      ctx.selectingRegionCurrentPt = { mouseX, mouseY };
      return;
    }

    if (e.shiftKey) {
      performRegionUpdate(ctx, () => {
        ctx.region.recentre(regionMouseX, regionMouseY);
      });
      return render();
    }

    if (e.altKey) {
      switch (ctx.currentFractalSetId) {
        case C.FRACTAL_SET_ID_MANDELBROT: {
          const juliaConstant = {
            x: regionMouseX,
            y: regionMouseY,
          };
          makeConfigurationChanges(ctx, {
            fractalSetId: C.FRACTAL_SET_ID_JULIA,
            juliaConstant,
          });
          render();
          return;
        }

        case C.FRACTAL_SET_ID_JULIA:
          makeConfigurationChanges(ctx, { fractalSetId: C.FRACTAL_SET_ID_MANDELBROT });
          render();
          return;

        default:
          return;
      }
    }
  };

  const onCanvasMouseMoveHandler = (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    if (ctx.selectingRegion) {
      ctx.selectingRegionCurrentPt = { mouseX, mouseY };
      ctx.overlay.drawSelectionRegion(
        ctx.selectingRegionInitialPt.mouseX,
        ctx.selectingRegionInitialPt.mouseY,
        ctx.selectingRegionCurrentPt.mouseX,
        ctx.selectingRegionCurrentPt.mouseY
      );
    }
  };

  const onCanvasMouseUpHandler = () => {
    if (ctx.selectingRegion) {
      const initialPt = ctx.selectingRegionInitialPt;
      const currentPt = ctx.selectingRegionCurrentPt;
      const topMouseY = Math.max(initialPt.mouseY, currentPt.mouseY);
      const bottomMouseY = Math.min(initialPt.mouseY, currentPt.mouseY);
      const leftMouseX = Math.min(initialPt.mouseX, currentPt.mouseX);
      const rightMouseX = Math.max(initialPt.mouseX, currentPt.mouseX);
      const diffX = rightMouseX - leftMouseX;
      const diffY = topMouseY - bottomMouseY;
      if (Math.hypot(diffX, diffY) >= 5) {
        const regionMouseBottomLeft = ctx.region.mouseToRegion(
          ctx.canvas,
          leftMouseX,
          bottomMouseY
        );
        const regionMouseTopRight = ctx.region.mouseToRegion(ctx.canvas, rightMouseX, topMouseY);
        const bottomLeft = {
          x: regionMouseBottomLeft.regionMouseX,
          y: regionMouseBottomLeft.regionMouseY,
        };
        const topRight = {
          x: regionMouseTopRight.regionMouseX,
          y: regionMouseTopRight.regionMouseY,
        };
        performRegionUpdate(ctx, () => {
          ctx.region.set(bottomLeft, topRight);
        });
        setCanvasAndViewportSize(ctx);
        render();
      }

      ctx.overlay.clearSelectionRegion();

      ctx.selectingRegion = false;
    }
  };

  const onCanvasMouseLeaveHandler = () => {
    if (ctx.selectingRegion) {
      ctx.overlay.clearSelectionRegion();
      ctx.selectingRegionInitialPt = undefined;
      ctx.selectingRegionCurrentPt = undefined;
      ctx.selectingRegion = false;
    }
  };

  return () => {
    ctx.canvas.addEventListener("mousedown", onCanvasMouseDownHandler);
    ctx.canvas.addEventListener("mousemove", onCanvasMouseMoveHandler);
    ctx.canvas.addEventListener("mouseup", onCanvasMouseUpHandler);
    ctx.canvas.addEventListener("mouseleave", onCanvasMouseLeaveHandler);

    new Gesture(ctx.canvas, {
      onDragStart,
      onDrag,
      onDragEnd,
      onPinchStart,
      onPinch,
      onPinchEnd,
    });
  };
};
