import * as glm from "gl-matrix";

export const bindFractalVertexState = (ctx) => {
  const { gl, currentFractalSet } = ctx;
  if (!currentFractalSet) {
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, currentFractalSet.vertexPositionBuffer);
  gl.vertexAttribPointer(currentFractalSet.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(currentFractalSet.aVertexPosition);
};

export const updateRegionUniforms = (ctx) => {
  const { gl, region, currentFractalSet } = ctx;
  if (!currentFractalSet) {
    return;
  }

  gl.uniform2f(currentFractalSet.uRegionCentre, region.centreX, region.centreY);
  gl.uniform2f(currentFractalSet.uRegionHalfSize, region.width / 2, region.height / 2);
};

export const performRegionUpdate = (ctx, thunk) => {
  thunk();
  updateRegionUniforms(ctx);
};

// Some or all configuration values are being changed.
export const makeConfigurationChanges = (
  ctx,
  { fractalSetId, juliaConstant, colourMapId, maxIterations, regionBottomLeft, regionTopRight }
) => {
  const { gl, region, fractalSets, colourMaps, smoothColouring } = ctx;

  if (regionBottomLeft && regionTopRight) {
    performRegionUpdate(ctx, () => {
      region.set(regionBottomLeft, regionTopRight);
    });
  }

  if (Number.isInteger(fractalSetId)) {
    ctx.currentFractalSetId = fractalSetId;
    ctx.currentFractalSet = fractalSets.get(fractalSetId);
  }

  if (juliaConstant) {
    ctx.currentJuliaConstant = juliaConstant;
  }

  if (Number.isInteger(colourMapId)) {
    ctx.currentColourMapId = colourMapId;
    ctx.currentColourMap = colourMaps.get(colourMapId);
  }

  if (Number.isInteger(maxIterations)) {
    ctx.currentMaxIterations = maxIterations;
  }

  gl.useProgram(ctx.currentFractalSet.program);
  bindFractalVertexState(ctx);

  const modelViewMatrix = glm.mat4.fromScaling(glm.mat4.create(), [1, -1, 1]);
  gl.uniformMatrix4fv(ctx.currentFractalSet.uModelViewMatrix, false, modelViewMatrix);
  updateRegionUniforms(ctx);

  gl.uniform1i(ctx.currentFractalSet.uColourMap, ctx.currentColourMap.textureUnit);

  gl.uniform2f(
    ctx.currentFractalSet.uJuliaConstant,
    ctx.currentJuliaConstant.x,
    ctx.currentJuliaConstant.y
  );

  gl.uniform1i(ctx.currentFractalSet.uSmoothColouring, smoothColouring);
  gl.uniform1i(ctx.currentFractalSet.uReturnIteration, false);
  gl.uniform1i(ctx.currentFractalSet.uMaxIterations, ctx.currentMaxIterations);
};

// Implies all configuration values are being changed.
export const switchToBookmark = (ctx, bookmark) => {
  makeConfigurationChanges(ctx, bookmark);
};
