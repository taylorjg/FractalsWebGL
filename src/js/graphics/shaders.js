import * as C from "@app/js/constants";
import { shaderSources } from "./shader-sources";

const MARKER = "// INSERT-COMMON-CODE-HERE\n";

const insertCommonShaderSources = (source, commonShaderSources) => {
  if (commonShaderSources?.length > 0) {
    const markerPos = source.indexOf(MARKER);
    if (markerPos >= 0) {
      const insertPos = markerPos + MARKER.length;
      const concatenatedCommonShaderSources = commonShaderSources.join("\n");
      const before = source.substring(0, insertPos);
      const after = source.substring(insertPos);
      return before + concatenatedCommonShaderSources + after;
    }
  }
  return source;
};

const makeShader = (gl, source, shaderType, commonShaderSources) => {
  const updatedSource = insertCommonShaderSources(source, commonShaderSources);
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, updatedSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const errorMessage = gl.getShaderInfoLog(shader);
    console.error(`Failed to compile shader: ${errorMessage}`);
    return null;
  }
  return shader;
};

const initialiseShadersHelper = (
  ctx,
  name,
  vertexShaderSource,
  fragmentShaderSource,
  loopShaderSource
) => {
  const { gl, isWebGL2 } = ctx;
  const commonShaderSources = [loopShaderSource];
  const vertexShader = makeShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = makeShader(
    gl,
    fragmentShaderSource,
    gl.FRAGMENT_SHADER,
    commonShaderSources
  );
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const errorMessage = gl.getProgramInfoLog(program);
    console.error(`Failed to link program: ${errorMessage}`);
    return;
  }
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    const errorMessage = gl.getProgramInfoLog(program);
    console.error(`Failed to validate program: ${errorMessage}`);
    return;
  }

  const aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  gl.enableVertexAttribArray(aVertexPosition);

  const aRegionPosition = gl.getAttribLocation(program, "aRegionPosition");
  gl.enableVertexAttribArray(aRegionPosition);

  const regionPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, regionPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 4 * 2 * 4, gl.DYNAMIC_DRAW);

  const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  const uColourMap = gl.getUniformLocation(program, "uColourMap");
  const uJuliaConstant = gl.getUniformLocation(program, "uJuliaConstant");

  const uSmoothColouring = gl.getUniformLocation(program, "uSmoothColouring");
  const uReturnIteration = gl.getUniformLocation(program, "uReturnIteration");

  const maybeMaxIterationsUniform = isWebGL2
    ? { uMaxIterations: gl.getUniformLocation(program, "uMaxIterations") }
    : undefined;

  // prettier-ignore
  const vertexPositionBufferData = new Float32Array([
    1.0, 1.0, // top right
    -1.0, 1.0, // top left
    1.0, -1.0, // bottom right
    -1.0, -1.0 // bottom left
  ]);
  const vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexPositionBufferData, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);

  return {
    name,
    program,
    aVertexPosition,
    aRegionPosition,
    uModelViewMatrix,
    ...maybeMaxIterationsUniform,
    uColourMap,
    uJuliaConstant,
    uSmoothColouring,
    uReturnIteration,
    vertexPositionBuffer,
    regionPositionBuffer,
  };
};

export const initialiseShaders = (ctx) => {
  const sources = ctx.isWebGL2 ? shaderSources.webgl2 : shaderSources.webgl1;
  const mandelbrotSet = initialiseShadersHelper(
    ctx,
    "Mandelbrot",
    sources.vertex,
    sources.mandelbrot,
    sources.loop
  );
  const juliaSet = initialiseShadersHelper(
    ctx,
    "Julia",
    sources.vertex,
    sources.julia,
    sources.loop
  );
  ctx.fractalSets.set(C.FRACTAL_SET_ID_MANDELBROT, mandelbrotSet);
  ctx.fractalSets.set(C.FRACTAL_SET_ID_JULIA, juliaSet);
};
