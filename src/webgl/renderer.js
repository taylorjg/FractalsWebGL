export const configureRenderer = (ctx, { createBookmark }) => {
  const hideConfigurationSummary = () => {
    ctx.overlay.hideConfigurationSummary();
    ctx.configurationSummaryOpen = false;
  };

  const showConfigurationSummary = () => {
    const configuration = createBookmark();
    ctx.overlay.showConfigurationSummary(configuration);
    ctx.configurationSummaryOpen = true;
  };

  const updateConfigurationSummary = () => {
    const configuration = createBookmark();
    ctx.overlay.updateConfigurationSummary(configuration);
  };

  const render = (returnIteration = false) => {
    const { gl, currentFractalSet, queryParamOptions } = ctx;

    if (returnIteration) {
      gl.uniform1i(currentFractalSet.uReturnIteration, true);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (returnIteration) {
      gl.uniform1i(currentFractalSet.uReturnIteration, false);
    }

    if (queryParamOptions.manualMode) {
      updateConfigurationSummary();
    }
  };

  return {
    render,
    hideConfigurationSummary,
    showConfigurationSummary,
    updateConfigurationSummary,
  };
};
