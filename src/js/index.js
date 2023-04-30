import PromiseWorker from "promise-worker";
import * as glm from "gl-matrix";
import colormap from "colormap";
import vertexShaderSourceWebGL1 from "../shaders/webgl1/shader.vert.glsl";
import mandelbrotShaderSourceWebGL1 from "../shaders/webgl1/mandelbrot.frag.glsl";
import juliaShaderSourceWebGL1 from "../shaders/webgl1/julia.frag.glsl";
import vertexShaderSourceWebGL2 from "../shaders/webgl2/shader.vert.glsl";
import mandelbrotShaderSourceWebGL2 from "../shaders/webgl2/mandelbrot.frag.glsl";
import juliaShaderSourceWebGL2 from "../shaders/webgl2/julia.frag.glsl";
import { configureUI } from "./ui";
import * as C from "./constants";

const worker = new Worker(new URL("./web-worker.js", import.meta.url));
const promiseWorker = new PromiseWorker(worker);

let canvas;
let gl;

const createColourMapTexture = (colourMap, textureUnit) => {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  const pixels = new Uint8Array(colourMap.map((value) => value * 255));
  const level = 0;
  const width = colourMap.length / 4;
  const height = 1;
  const border = 0;
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    gl.RGBA,
    width,
    height,
    border,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixels
  );
};

const loadColourMap = (name, textureUnit) => {
  const colourMap = colormap({
    colormap: name,
    nshades: 256,
    format: "float",
  }).flat();
  createColourMapTexture(colourMap, textureUnit);
  return {
    name,
    colourMap,
    textureUnit,
  };
};

const loadColourMaps = () => {
  C.COLOUR_MAP_NAMES.forEach((colourMapName, index) => {
    colourMaps.set(index, loadColourMap(colourMapName, index));
  });
};

const fractalSets = new Map();
const colourMaps = new Map();

let currentMaxIterations = C.INITIAL_ITERATIONS;
let currentFractalSetId = undefined;
let currentFractalSet = undefined;
let currentJuliaConstant = undefined;
let currentColourMapId = undefined;
let currentColourMap = undefined;
let regionBottomLeft = {};
let regionTopRight = {};
let panning = false;
let lastMousePt;
let bookmarkMode = false;
let bookmarks = new Map();
let nextBookmarkId = 0;
let modalOpen = false;

const onModalOpen = () => {
  console.log("[onModalOpen]");
  modalOpen = true;
};

const onModalClose = () => {
  console.log("[onModalClose]");
  modalOpen = false;
};

const loadBookmarks = (bookmarks) => {
  const mapEntries = JSON.parse(localStorage.bookmarks || "[]");
  for (const [id, bookmark] of mapEntries) {
    bookmarks.set(id, bookmark);
  }
};

const saveBookmarks = (bookmarks) => {
  localStorage.bookmarks = JSON.stringify(Array.from(bookmarks.entries()));
};

const addBookmark = (bookmark) => {
  bookmark.id = nextBookmarkId++;
  bookmarks.set(bookmark.id, bookmark);
  saveBookmarks(bookmarks);
};

const updateBookmark = (bookmark) => {
  bookmarks.set(bookmark.id, bookmark);
  saveBookmarks(bookmarks);
};

const deleteBookmark = (bookmark) => {
  bookmarks.delete(bookmark.id);
  saveBookmarks(bookmarks);
};

const createBookmark = (name) => ({
  name: name || `Bookmark${nextBookmarkId}`,
  fractalSetId: currentFractalSetId,
  juliaConstant: { ...currentJuliaConstant },
  colourMapId: currentColourMapId,
  regionBottomLeft: { ...regionBottomLeft },
  regionTopRight: { ...regionTopRight },
  maxIterations: currentMaxIterations,
});

const switchToBookmark = (bookmark) => {
  regionBottomLeft.x = bookmark.regionBottomLeft.x;
  regionBottomLeft.y = bookmark.regionBottomLeft.y;
  regionTopRight.x = bookmark.regionTopRight.x;
  regionTopRight.y = bookmark.regionTopRight.y;
  currentMaxIterations = bookmark.maxIterations;
  setCurrentFractalSet(
    bookmark.fractalSetId,
    bookmark.juliaConstant,
    bookmark.colourMapId
  );
};

const ui = configureUI({
  addBookmark,
  updateBookmark,
  deleteBookmark,
  switchToBookmark,
  fractalSets,
  colourMaps,
  onModalOpen,
  onModalClose,
});

const initGL = (canvas) => {
  const contextAttributes = { preserveDrawingBuffer: true };
  // gl = canvas.getContext("webgl2", contextAttributes) || canvas.getContext("webgl", contextAttributes)
  // I'm just using "webgl" for the moment because I'm having problems with "webgl2" on iPad (Safari/Chrome).
  gl = canvas.getContext("webgl", contextAttributes);
  if (!gl) {
    console.error("Failed to initialise WebGL");
  }
};

const isWebGL2 = () => gl instanceof WebGL2RenderingContext;

const getShader = (gl, source, shaderType) => {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const errorMessage = gl.getShaderInfoLog(shader);
    console.error(`Failed to compile shader: ${errorMessage}`);
    return null;
  }
  return shader;
};

const initShadersHelper = (name, vertexShaderSource, fragmentShaderSource) => {
  const vertexShader = getShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = getShader(
    gl,
    fragmentShaderSource,
    gl.FRAGMENT_SHADER
  );
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const errorMessage = gl.getProgramInfoLog(program);
    console.error(`Could not initialise shaders: ${errorMessage}`);
    return;
  }

  const aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  gl.enableVertexAttribArray(aVertexPosition);

  const aPlotPosition = gl.getAttribLocation(program, "aPlotPosition");
  gl.enableVertexAttribArray(aPlotPosition);

  const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  const uColourMap = gl.getUniformLocation(program, "uColourMap");
  const uJuliaConstant = gl.getUniformLocation(program, "uJuliaConstant");

  const maybeMaxIterationsUniform = isWebGL2()
    ? { uMaxIterations: gl.getUniformLocation(program, "uMaxIterations") }
    : undefined;

  const vertices = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  const vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);

  return {
    name,
    program,
    aVertexPosition,
    aPlotPosition,
    uModelViewMatrix,
    ...maybeMaxIterationsUniform,
    uColourMap,
    uJuliaConstant,
    vertexPositionBuffer,
  };
};

const initShaders = () => {
  const vertexShaderSource = isWebGL2()
    ? vertexShaderSourceWebGL2
    : vertexShaderSourceWebGL1;
  const mandelbrotShaderSource = isWebGL2()
    ? mandelbrotShaderSourceWebGL2
    : mandelbrotShaderSourceWebGL1;
  const juliaShaderSource = isWebGL2()
    ? juliaShaderSourceWebGL2
    : juliaShaderSourceWebGL1;
  const mandelbrotSet = initShadersHelper(
    "Mandelbrot",
    vertexShaderSource,
    mandelbrotShaderSource
  );
  const juliaSet = initShadersHelper(
    "Julia",
    vertexShaderSource,
    juliaShaderSource
  );
  fractalSets.set(C.FRACTAL_SET_ID_MANDELBROT, mandelbrotSet);
  fractalSets.set(C.FRACTAL_SET_ID_JULIA, juliaSet);
};

const setCurrentFractalSet = (fractalSetId, juliaConstant, colourMapId) => {
  if (Number.isInteger(fractalSetId)) {
    currentFractalSetId = fractalSetId;
    currentFractalSet = fractalSets.get(fractalSetId);
  }

  if (juliaConstant) {
    currentJuliaConstant = juliaConstant;
  }
  if (!currentJuliaConstant) {
    currentJuliaConstant = { x: 0, y: 0 };
  }

  if (Number.isInteger(colourMapId)) {
    currentColourMapId = colourMapId;
    currentColourMap = colourMaps.get(colourMapId);
  }

  gl.useProgram(currentFractalSet.program);

  const modelViewMatrix = glm.mat4.create();
  glm.mat4.fromScaling(modelViewMatrix, [1, -1, 1]);
  gl.uniformMatrix4fv(
    currentFractalSet.uModelViewMatrix,
    false,
    modelViewMatrix
  );

  gl.uniform1i(currentFractalSet.uColourMap, currentColourMap.textureUnit);
  gl.uniform2f(
    currentFractalSet.uJuliaConstant,
    currentJuliaConstant.x,
    currentJuliaConstant.y
  );

  setCanvasAndViewportSize();

  render();
};

const render = () => {
  const corners = [
    regionTopRight.x,
    regionTopRight.y,
    regionBottomLeft.x,
    regionTopRight.y,
    regionTopRight.x,
    regionBottomLeft.y,
    regionBottomLeft.x,
    regionBottomLeft.y,
  ];
  const plotPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, plotPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);
  gl.vertexAttribPointer(
    currentFractalSet.aPlotPosition,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  if (isWebGL2()) {
    gl.uniform1i(currentFractalSet.uMaxIterations, currentMaxIterations);
  }
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.deleteBuffer(plotPositionBuffer);
};

const displayConfiguration = async (configuration) => {
  switchToBookmark(configuration);
  const message = {
    type: "chooseConfiguration",
    fractalSetIds: [C.FRACTAL_SET_ID_MANDELBROT, C.FRACTAL_SET_ID_JULIA],
    colourMapIds: Array.from(colourMaps.keys()),
  };
  const newConfiguration = await promiseWorker.postMessage(message);
  setTimeout(displayConfiguration, 10000, newConfiguration);
};

const start = async (manualMode) => {
  // Turning off the service worker for the moment. Not quite happy with it yet.
  // if ('serviceWorker' in navigator) {
  //   try {
  //     const registration = await navigator.serviceWorker.register('service-worker.js')
  //     console.log('Successfully registered service worker', registration)
  //   } catch (error) {
  //     console.error(`Failed to register service worker: ${error.message}`)
  //   }
  // }

  canvas = document.getElementById("canvas");

  initGL(canvas);
  initShaders();
  loadColourMaps();

  window.addEventListener("resize", onWindowResize);

  if (manualMode) {
    canvas.addEventListener("mousedown", onCanvasMouseDownHandler);
    canvas.addEventListener("mousemove", onCanvasMouseMoveHandler);
    canvas.addEventListener("mouseup", onCanvasMouseUpHandler);
    canvas.addEventListener("mouseleave", onCanvasMouseLeaveHandler);
    document.addEventListener("keydown", onDocumentKeyDownHandler);
    loadBookmarks(bookmarks);
    nextBookmarkId = bookmarks.size ? Math.max(...bookmarks.keys()) + 1 : 0;
    switchToBookmark(C.INITIAL_BOOKMARK);
  } else {
    displayConfiguration(C.INITIAL_BOOKMARK);
    const animate = () => {
      panRegion(0.01);
      zoomRegion(0.01);
      render();
      requestAnimationFrame(animate);
    };
    animate();
  }
};

const adjustRegionAspectRatio = (canvasWidth, canvasHeight) => {
  const regionWidth = regionTopRight.x - regionBottomLeft.x;
  const regionHeight = regionTopRight.y - regionBottomLeft.y;

  if (canvasWidth > canvasHeight) {
    const widthDelta =
      (canvasWidth / canvasHeight) * regionHeight - regionWidth;
    const widthDeltaHalf = widthDelta / 2;
    regionBottomLeft.x -= widthDeltaHalf;
    regionTopRight.x += widthDeltaHalf;
  }

  if (canvasWidth < canvasHeight) {
    const heightDelta =
      (canvasHeight / canvasWidth) * regionWidth - regionHeight;
    const heightDeltaHalf = heightDelta / 2;
    regionBottomLeft.y -= heightDeltaHalf;
    regionTopRight.y += heightDeltaHalf;
  }
};

const panRegion = (percent) => {
  const regionWidth = regionTopRight.x - regionBottomLeft.x;
  const regionHeight = regionTopRight.y - regionBottomLeft.y;
  const widthDelta = (regionWidth / 100) * percent;
  const heightDelta = (regionHeight / 100) * percent;
  regionBottomLeft.x -= widthDelta;
  regionBottomLeft.y -= heightDelta;
  regionTopRight.x -= widthDelta;
  regionTopRight.y -= heightDelta;
};

const zoomRegion = (percent) => {
  const regionWidth = regionTopRight.x - regionBottomLeft.x;
  const regionHeight = regionTopRight.y - regionBottomLeft.y;
  const widthDelta = (regionWidth / 100) * percent;
  const widthDeltaHalf = widthDelta / 2;
  const heightDelta = (regionHeight / 100) * percent;
  const heightDeltaHalf = heightDelta / 2;
  regionBottomLeft.x += widthDeltaHalf;
  regionBottomLeft.y += heightDeltaHalf;
  regionTopRight.x -= widthDeltaHalf;
  regionTopRight.y -= heightDeltaHalf;
};

const setCanvasAndViewportSize = () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  adjustRegionAspectRatio(canvas.width, canvas.height);
};

const onWindowResize = () => {
  setCanvasAndViewportSize();
  render();
};

const mouseToRegion = (mouseX, mouseY) => {
  const regionWidth = regionTopRight.x - regionBottomLeft.x;
  const regionHeight = regionTopRight.y - regionBottomLeft.y;
  return {
    regionMouseX: regionBottomLeft.x + (mouseX * regionWidth) / canvas.width,
    regionMouseY: regionBottomLeft.y + (mouseY * regionHeight) / canvas.height,
  };
};

const onCanvasMouseDownHandler = (e) => {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const { regionMouseX, regionMouseY } = mouseToRegion(mouseX, mouseY);

  if (e.shiftKey) {
    const regionWidth = regionTopRight.x - regionBottomLeft.x;
    const regionHeight = regionTopRight.y - regionBottomLeft.y;
    const regionCentreX = regionBottomLeft.x + regionWidth / 2;
    const regionCentreY = regionBottomLeft.y + regionHeight / 2;
    const translationX = regionMouseX - regionCentreX;
    const translationY = regionMouseY - regionCentreY;
    regionBottomLeft.x += translationX;
    regionBottomLeft.y += translationY;
    regionTopRight.x += translationX;
    regionTopRight.y += translationY;
    return render();
  }

  if (e.altKey) {
    switch (currentFractalSetId) {
      case C.FRACTAL_SET_ID_MANDELBROT:
        return setCurrentFractalSet(C.FRACTAL_SET_ID_JULIA, {
          x: regionMouseX,
          y: regionMouseY,
        });

      case C.FRACTAL_SET_ID_JULIA:
        return setCurrentFractalSet(C.FRACTAL_SET_ID_MANDELBROT);

      default:
        return;
    }
  }

  panning = true;
  lastMousePt = { mouseX, mouseY };
};

const onCanvasMouseMoveHandler = (e) => {
  if (!panning) {
    return;
  }

  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const mouseDeltaX = mouseX - lastMousePt.mouseX;
  const mouseDeltaY = mouseY - lastMousePt.mouseY;
  const regionWidth = regionTopRight.x - regionBottomLeft.x;
  const regionHeight = regionTopRight.y - regionBottomLeft.y;
  const regionDeltaX = (mouseDeltaX * regionWidth) / canvas.width;
  const regionDeltaY = (mouseDeltaY * regionHeight) / canvas.height;
  regionBottomLeft.x -= regionDeltaX;
  regionBottomLeft.y -= regionDeltaY;
  regionTopRight.x -= regionDeltaX;
  regionTopRight.y -= regionDeltaY;

  render();

  lastMousePt = { mouseX, mouseY };
};

const onCanvasMouseUpHandler = () => {
  panning = false;
};

const onCanvasMouseLeaveHandler = () => {
  panning = false;
};

const onDocumentKeyDownHandler = (e) => {
  if (modalOpen) return;

  if (bookmarkMode) {
    return handleBookmarkKeys(e);
  }

  if (!bookmarkMode && e.key === "b" && e.ctrlKey) {
    bookmarkMode = true;
    return;
  }

  if (e.key === "+") {
    zoomRegion(50);
    return render();
  }

  if (e.key === "-") {
    zoomRegion(-100);
    return render();
  }

  if (e.key === "h" && e.ctrlKey) {
    return switchToBookmark(C.HOME_BOOKMARK);
  }

  if ((e.key === "c" || e.key === "C") && e.ctrlKey) {
    const keys = Array.from(colourMaps.keys());
    const maxIndex = keys.length;
    const oldIndex = keys.indexOf(currentColourMapId);
    const newIndex = (oldIndex + (e.shiftKey ? maxIndex - 1 : 1)) % maxIndex;
    const newColourMapId = keys[newIndex];
    return setCurrentFractalSet(undefined, undefined, newColourMapId);
  }

  if (isWebGL2()) {
    if (e.key === "i" || e.key === "I") {
      const delta = C.DELTA_ITERATIONS * (e.shiftKey ? -1 : +1);
      currentMaxIterations = currentMaxIterations + delta;
      currentMaxIterations = Math.min(currentMaxIterations, C.MAX_ITERATIONS);
      currentMaxIterations = Math.max(currentMaxIterations, C.MIN_ITERATIONS);
      return render();
    }
  }
};

const handleBookmarkKeys = (e) => {
  bookmarkMode = false;

  if (e.key === "n") {
    const bookmark = createBookmark();
    return ui.presentBookmarkModal(bookmark);
  }

  if (e.key === "l") {
    return ui.presentManageBookmarksModal(bookmarks);
  }
};

const url = new URL(document.location);
const manualMode = url.searchParams.get("mode") === "manual";

start(manualMode);
