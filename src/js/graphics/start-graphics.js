import { configureConfigurationChooser } from "@app/js/configuration-chooser";
import { configureOverlay } from "@app/js/overlay";
import { configureThumbnail } from "@app/js/thumbnail";
import { configureUI } from "@app/ui";
import * as C from "@app/js/constants";
import { createAppContext } from "./app-context";
import { startAutoMode } from "./auto-mode";
import { configureBookmarks } from "./bookmarks";
import { createWindowResizeHandler, setCanvasAndViewportSize } from "./canvas-size";
import { loadColourMaps } from "./colour-maps";
import { switchToBookmark } from "./configuration";
import { initialiseWebGL } from "./context";
import { configureInput } from "./input";
import { configureRenderer } from "./renderer";
import { initialiseShaders } from "./shaders";

export const startGraphics = (queryParamOptionsArg) => {
  const ctx = createAppContext();
  ctx.queryParamOptions = queryParamOptionsArg;
  ctx.canvas = document.getElementById("canvas");

  if (!initialiseWebGL(ctx, ctx.canvas)) {
    return;
  }

  initialiseShaders(ctx);
  loadColourMaps(ctx);

  ctx.overlay = configureOverlay({
    fractalSets: ctx.fractalSets,
    colourMaps: ctx.colourMaps,
  });

  const {
    loadBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    createBookmark,
    onModalOpen,
    onModalClose,
  } = configureBookmarks(ctx);

  const { render, hideConfigurationSummary, showConfigurationSummary, updateConfigurationSummary } =
    configureRenderer(ctx, { createBookmark });

  ctx.thumbnail = configureThumbnail({
    gl: ctx.gl,
    createBookmark,
    switchToBookmark: (bookmark) => switchToBookmark(ctx, bookmark),
    setCanvasAndViewportSize: (width, height) => setCanvasAndViewportSize(ctx, width, height),
    render,
  });

  const fractalSetIds = Array.from(ctx.fractalSets.keys());
  const colourMapIds = Array.from(ctx.colourMaps.keys());

  ctx.configurationChooser = configureConfigurationChooser({
    renderThumbnail: ctx.thumbnail.renderThumbnail,
    fractalSetIds,
    colourMapIds,
    preview: ctx.queryParamOptions.preview,
  });

  ctx.ui = configureUI({
    renderThumbnail: ctx.thumbnail.renderThumbnail,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    switchToBookmark: (bookmark) => {
      switchToBookmark(ctx, bookmark);
      setCanvasAndViewportSize(ctx);
      render();
    },
    fractalSets: ctx.fractalSets,
    colourMaps: ctx.colourMaps,
    onModalOpen,
    onModalClose,
  });

  window.addEventListener("resize", createWindowResizeHandler(ctx, render));

  if (ctx.queryParamOptions.manualMode) {
    const { attachInputListeners } = configureInput(ctx, {
      render,
      createBookmark,
      hideConfigurationSummary,
      showConfigurationSummary,
    });
    attachInputListeners();

    loadBookmarks();
    ctx.nextBookmarkId = ctx.bookmarks.size ? Math.max(...ctx.bookmarks.keys()) + 1 : 0;
    switchToBookmark(ctx, C.INITIAL_BOOKMARK);
    setCanvasAndViewportSize(ctx);
    render();
  } else {
    startAutoMode(ctx, {
      render,
      updateConfigurationSummary,
      initialBookmark: C.INITIAL_BOOKMARK,
    });
  }
};
