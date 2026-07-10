import * as U from "@app/js/utils";
import { performRegionUpdate, switchToBookmark } from "./configuration";
import { setCanvasAndViewportSize } from "./canvas-size";

const CHANGE_REGION_INTERVAL_SECONDS = 10;

export const doIdleTasks = (ctx) => {
  if (!ctx.nextConfiguration) {
    ctx.nextConfiguration = ctx.configurationChooser.chooseConfiguration(
      CHANGE_REGION_INTERVAL_SECONDS
    );
    ctx.nextConfigurationCount++;
  }
};

export const displayConfiguration = (
  ctx,
  { updateConfigurationSummary },
  explicitConfiguration
) => {
  const configuration = explicitConfiguration ?? ctx.nextConfiguration;
  if (configuration) {
    if (!explicitConfiguration) {
      console.log("[displayConfiguration]", "nextConfigurationCount:", ctx.nextConfigurationCount);
      ctx.nextConfiguration = undefined;
      ctx.nextConfigurationCount = 0;
    }
    switchToBookmark(ctx, configuration);
    setCanvasAndViewportSize(ctx);
    updateConfigurationSummary();
    ctx.panSpeedX = configuration.panSpeedX ?? U.randomPanSpeed();
    ctx.panSpeedY = configuration.panSpeedY ?? U.randomPanSpeed();
    ctx.zoomSpeed = configuration.zoomSpeed ?? U.randomZoomSpeed();
  }

  setTimeout(
    () => displayConfiguration(ctx, { updateConfigurationSummary }),
    CHANGE_REGION_INTERVAL_SECONDS * 1000
  );
};

export const startAutoMode = (ctx, { render, updateConfigurationSummary, initialBookmark }) => {
  displayConfiguration(ctx, { updateConfigurationSummary }, initialBookmark);
  const animate = () => {
    performRegionUpdate(ctx, () => {
      ctx.region.panX(ctx.panSpeedX);
      ctx.region.panY(ctx.panSpeedY);
      ctx.region.zoom(ctx.zoomSpeed);
    });
    render();
    requestAnimationFrame(animate);
    doIdleTasks(ctx);
  };
  animate();
};
