import * as C from "@app/fractal/constants";
import * as U from "@app/fractal/utils";
import {
  makeConfigurationChanges,
  performRegionUpdate,
  switchToBookmark,
} from "@app/webgl/configuration";
import { setCanvasAndViewportSize } from "@app/webgl/canvas-size";

export const configureKeyboard = (
  ctx,
  { render, createBookmark, hideConfigurationSummary, showConfigurationSummary }
) => {
  const handleBookmarkKeys = (e) => {
    ctx.bookmarkMode = false;

    if (e.key === "n") {
      e.preventDefault();
      const bookmark = createBookmark();
      return ctx.ui.presentBookmarkModal(bookmark);
    }

    if (e.key === "l") {
      e.preventDefault();
      return ctx.ui.presentManageBookmarksModal(ctx.bookmarks);
    }
  };

  const onDocumentKeyDownHandler = (e) => {
    if (ctx.modalOpen) return;

    if (ctx.bookmarkMode) {
      return handleBookmarkKeys(e);
    }

    if (!ctx.bookmarkMode && e.key === "b") {
      ctx.bookmarkMode = true;
      return;
    }

    if (e.key === "+") {
      performRegionUpdate(ctx, () => {
        ctx.region.zoom(50);
      });
      render();
      return;
    }

    if (e.key === "-") {
      performRegionUpdate(ctx, () => {
        ctx.region.zoom(-100);
      });
      render();
      return;
    }

    if (e.key === "h") {
      switchToBookmark(ctx, C.HOME_BOOKMARK);
      setCanvasAndViewportSize(ctx);
      render();
      return;
    }

    if (e.key === "c" || e.key === "C") {
      const keys = Array.from(ctx.colourMaps.keys());
      const maxIndex = keys.length;
      const oldIndex = keys.indexOf(ctx.currentColourMapId);
      const newIndex = (oldIndex + (e.shiftKey ? maxIndex - 1 : 1)) % maxIndex;
      const newColourMapId = keys[newIndex];
      makeConfigurationChanges(ctx, { colourMapId: newColourMapId });
      render();
      return;
    }

    if (e.key === "i" || e.key === "I") {
      const delta = C.DELTA_ITERATIONS * (e.shiftKey ? -1 : +1);
      ctx.currentMaxIterations = U.clamp(
        C.MIN_ITERATIONS,
        C.MAX_ITERATIONS_MANUAL,
        ctx.currentMaxIterations + delta
      );
      makeConfigurationChanges(ctx, { maxIterations: ctx.currentMaxIterations });
      render();
      return;
    }

    if (e.key === "s") {
      ctx.smoothColouring = !ctx.smoothColouring;
      makeConfigurationChanges(ctx, {});
      render();
    }

    if (e.key === "v") {
      if (ctx.configurationSummaryOpen) {
        hideConfigurationSummary();
      } else {
        showConfigurationSummary();
      }
    }
  };

  return () => {
    document.addEventListener("keydown", onDocumentKeyDownHandler);
  };
};
