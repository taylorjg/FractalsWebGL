import * as glm from "gl-matrix";

export const updateRegionPositionBuffer = (ctx) => {
  const { gl, region, currentFractalSet } = ctx;
  if (!currentFractalSet) return;

  const { regionPositionBuffer, aRegionPosition } = currentFractalSet;

  // prettier-ignore
  const regionPositionBufferData = new Float32Array([
    region.topRight.x, region.topRight.y,
    region.topLeft.x, region.topLeft.y,
    region.bottomRight.x, region.bottomRight.y,
    region.bottomLeft.x, region.bottomLeft.y,
  ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, regionPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, regionPositionBufferData, gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(aRegionPosition, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

export const performRegionUpdate = (ctx, thunk) => {
  thunk();
  updateRegionPositionBuffer(ctx);
};

// Some or all configuration values are being changed.
export const makeConfigurationChanges = (
  ctx,
  { fractalSetId, juliaConstant, colourMapId, maxIterations, regionBottomLeft, regionTopRight }
) => {
  const { gl, region, fractalSets, colourMaps, isWebGL2, smoothColouring } = ctx;

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

  if (isWebGL2 && Number.isInteger(maxIterations)) {
    ctx.currentMaxIterations = maxIterations;
  }

  gl.useProgram(ctx.currentFractalSet.program);

  const modelViewMatrix = glm.mat4.fromScaling(glm.mat4.create(), [1, -1, 1]);
  gl.uniformMatrix4fv(ctx.currentFractalSet.uModelViewMatrix, false, modelViewMatrix);

  gl.uniform1i(ctx.currentFractalSet.uColourMap, ctx.currentColourMap.textureUnit);

  gl.uniform2f(
    ctx.currentFractalSet.uJuliaConstant,
    ctx.currentJuliaConstant.x,
    ctx.currentJuliaConstant.y
  );

  gl.uniform1i(ctx.currentFractalSet.uSmoothColouring, smoothColouring);
  gl.uniform1i(ctx.currentFractalSet.uReturnIteration, false);

  if (isWebGL2) {
    gl.uniform1i(ctx.currentFractalSet.uMaxIterations, ctx.currentMaxIterations);
  }
};

// Implies all configuration values are being changed.
export const switchToBookmark = (ctx, bookmark) => {
  makeConfigurationChanges(ctx, bookmark);
};
