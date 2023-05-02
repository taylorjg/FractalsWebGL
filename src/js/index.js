import colormap from "colormap";
import * as glm from "gl-matrix";
import PromiseWorker from "promise-worker";
import vertexShaderSourceWebGL1 from "../shaders/webgl1/shader.vert.glsl";
import mandelbrotShaderSourceWebGL1 from "../shaders/webgl1/mandelbrot.frag.glsl";
import juliaShaderSourceWebGL1 from "../shaders/webgl1/julia.frag.glsl";
import vertexShaderSourceWebGL2 from "../shaders/webgl2/shader.vert.glsl";
import mandelbrotShaderSourceWebGL2 from "../shaders/webgl2/mandelbrot.frag.glsl";
import juliaShaderSourceWebGL2 from "../shaders/webgl2/julia.frag.glsl";
import { configureUI } from "./ui";
import { Region } from "./region";
import * as C from "./constants";
import * as U from "./utils";

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
const region = new Region();
let panning = false;
let lastMousePt;
let bookmarkMode = false;
let bookmarks = new Map();
let nextBookmarkId = 0;
let modalOpen = false;

const onModalOpen = () => {
  modalOpen = true;
};

const onModalClose = () => {
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
  regionBottomLeft: { ...region.bottomLeft },
  regionTopRight: { ...region.topRight },
  maxIterations: currentMaxIterations,
});

const switchToBookmark = (bookmark) => {
  region.set(bookmark.regionBottomLeft, bookmark.regionTopRight);
  currentMaxIterations = bookmark.maxIterations;
  setCurrentFractalSet(
    bookmark.fractalSetId,
    bookmark.juliaConstant,
    bookmark.colourMapId
  );
};

// https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html
// https://stackoverflow.com/a/13640310
const createThumbnailDataUrl = (size) => {
  // Future enhancements: allow the caller to pass in:
  // - a different colour map name/index
  // - a different value for max iterations

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(
    gl.TEXTURE_2D, // target
    0, // level
    gl.RGBA, // internalFormat
    size, // width
    size, // height
    0, // border
    gl.RGBA, // format
    gl.UNSIGNED_BYTE, // type
    null // pixels
  );

  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER, // target
    gl.COLOR_ATTACHMENT0, // attachment
    gl.TEXTURE_2D, // texture target
    texture, // texture
    0 // level
  );

  const savedBottomLeft = region.bottomLeft;
  const savedTopRight = region.topRight;
  const minCanvasDimension = Math.min(canvas.width, canvas.height);
  region.adjustAspectRatio(minCanvasDimension, minCanvasDimension);
  gl.viewport(0, 0, size, size);

  // This is where we could override colour map, max iterations, etc.
  render();

  gl.viewport(0, 0, canvas.width, canvas.height);
  region.set(savedBottomLeft, savedTopRight);

  const pixels = new Uint8ClampedArray(size * size * 4);
  gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(fb);

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.deleteTexture(texture);

  const tempCanvas = document.createElement("canvas");
  const tempCanvasCtx2d = tempCanvas.getContext("2d");
  tempCanvas.width = size;
  tempCanvas.height = size;
  const imageData = new ImageData(pixels, size, size);
  tempCanvasCtx2d.putImageData(imageData, 0, 0);

  // Seems we need to flip the image vertically.
  // https://stackoverflow.com/a/41970080
  tempCanvasCtx2d.scale(1, -1);
  tempCanvasCtx2d.translate(0, -size);
  tempCanvasCtx2d.drawImage(tempCanvas, 0, 0);

  return tempCanvas.toDataURL("image/jpeg", 1.0);
};

const ui = configureUI({
  createThumbnailDataUrl,
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
  gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
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

  const plotPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, plotPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 4 * 2 * 4, gl.DYNAMIC_DRAW);

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
    plotPositionBuffer,
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
  const { plotPositionBuffer, aPlotPosition, uMaxIterations } =
    currentFractalSet;

  const corners = [
    region.topRight.x,
    region.topRight.y,
    region.topLeft.x,
    region.topLeft.y,
    region.bottomRight.x,
    region.bottomRight.y,
    region.bottomLeft.x,
    region.bottomLeft.y,
  ];
  gl.bindBuffer(gl.ARRAY_BUFFER, plotPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(aPlotPosition, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  if (isWebGL2()) {
    gl.uniform1i(uMaxIterations, currentMaxIterations);
  }

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const displayConfiguration = async (configuration) => {
  switchToBookmark(configuration);
  panSpeedX = randomFloat(-0.1, 0.1);
  panSpeedY = randomFloat(-0.1, 0.1);
  zoomSpeed = randomFloat(0.01, 0.1);
  const message = {
    type: "chooseConfiguration",
    fractalSetIds: [C.FRACTAL_SET_ID_MANDELBROT, C.FRACTAL_SET_ID_JULIA],
    colourMapIds: Array.from(colourMaps.keys()),
  };
  const newConfiguration = await promiseWorker.postMessage(message);
  setTimeout(displayConfiguration, 10000, newConfiguration);
};

const randomFloat = (min, max) => {
  return Math.random() * (max - min) + min;
};

let panSpeedX = 0;
let panSpeedY = 0;
let zoomSpeed = 0;

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
      region.panX(panSpeedX);
      region.panY(panSpeedY);
      region.zoom(zoomSpeed);
      render();
      requestAnimationFrame(animate);
    };
    animate();
  }
};

const setCanvasAndViewportSize = () => {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  region.adjustAspectRatio(canvas.width, canvas.height);
};

const onWindowResize = () => {
  setCanvasAndViewportSize();
  render();
};

const onCanvasMouseDownHandler = (e) => {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const { regionMouseX, regionMouseY } = region.mouseToRegion(
    canvas,
    mouseX,
    mouseY
  );

  if (e.shiftKey) {
    region.recentre(regionMouseX, regionMouseY);
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
  if (!panning) return;

  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const mouseDeltaX = mouseX - lastMousePt.mouseX;
  const mouseDeltaY = mouseY - lastMousePt.mouseY;
  region.move(canvas, mouseDeltaX, mouseDeltaY);

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
    region.zoom(50);
    return render();
  }

  if (e.key === "-") {
    region.zoom(-100);
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
      currentMaxIterations = U.clamp(
        C.MIN_ITERATIONS,
        C.MAX_ITERATIONS_MANUAL,
        currentMaxIterations + delta
      );
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
