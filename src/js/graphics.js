import colormap from "colormap";
import * as glm from "gl-matrix";
import PromiseWorker from "promise-worker";
import { configureUI } from "./ui";
import { Region } from "./region";
import * as C from "./constants";
import * as U from "./utils";

import vertexShaderSourceWebGL1 from "../shaders/webgl1/shader.vert.glsl";
import mandelbrotShaderSourceWebGL1 from "../shaders/webgl1/mandelbrot.frag.glsl";
import juliaShaderSourceWebGL1 from "../shaders/webgl1/julia.frag.glsl";

import vertexShaderSourceWebGL2 from "../shaders/webgl2/shader.vert.glsl";
import mandelbrotShaderSourceWebGL2 from "../shaders/webgl2/mandelbrot.frag.glsl";
import juliaShaderSourceWebGL2 from "../shaders/webgl2/julia.frag.glsl";

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
let panSpeedX = 0;
let panSpeedY = 0;
let zoomSpeed = 0;
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
  const entries = JSON.parse(localStorage.bookmarks || "[]");
  for (const [id, bookmark] of entries) {
    const { thumbnail: _thumbnail, ...bookmarkWithoutThumbnail } = bookmark;
    bookmarks.set(id, bookmarkWithoutThumbnail);
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

// Implies all configuration values are being changed.
const switchToBookmark = (bookmark) => {
  makeConfigurationChanges(bookmark);
};

// https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html
// https://stackoverflow.com/a/13640310
const renderThumbnail = (size, configuration) => {
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

  const savedConfiguration = createBookmark("saved-configuration");
  switchToBookmark(configuration);
  setCanvasAndViewportSize(size, size);

  render();

  const pixels = new Uint8ClampedArray(size * size * 4);
  gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  switchToBookmark(savedConfiguration);
  setCanvasAndViewportSize();

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(fb);

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.deleteTexture(texture);

  return pixels;
};

const initialiseWebGL = (canvas) => {
  const tryContextType = (contextType) => {
    try {
      gl = canvas.getContext(contextType);
      if (!gl) {
        alert(`Failed to initialise WebGL (contextType: ${contextType})`);
      }
    } catch (error) {
      alert(`Exception trying to initialise WebGL (contextType: ${contextType})\n${error.message}`);
    }

    return Boolean(gl);
  };

  if (!tryContextType("webgl2")) {
    tryContextType("webgl");
  }
};

const isWebGL2 = () => gl instanceof WebGL2RenderingContext;

const ui = configureUI({
  isWebGL2,
  renderThumbnail,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  switchToBookmark: (bookmark) => {
    switchToBookmark(bookmark);
    setCanvasAndViewportSize();
    render();
  },
  fractalSets,
  colourMaps,
  onModalOpen,
  onModalClose,
});

const makeShader = (gl, source, shaderType) => {
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

const initialiseShadersHelper = (name, vertexShaderSource, fragmentShaderSource) => {
  const vertexShader = makeShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = makeShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
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

  const aRegionPosition = gl.getAttribLocation(program, "aRegionPosition");
  gl.enableVertexAttribArray(aRegionPosition);

  const regionPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, regionPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 4 * 2 * 4, gl.DYNAMIC_DRAW);

  const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  const uColourMap = gl.getUniformLocation(program, "uColourMap");
  const uJuliaConstant = gl.getUniformLocation(program, "uJuliaConstant");

  const maybeMaxIterationsUniform = isWebGL2()
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
    vertexPositionBuffer,
    regionPositionBuffer,
  };
};

const initialiseShaders = () => {
  const vertexShaderSource = isWebGL2() ? vertexShaderSourceWebGL2 : vertexShaderSourceWebGL1;
  const mandelbrotShaderSource = isWebGL2()
    ? mandelbrotShaderSourceWebGL2
    : mandelbrotShaderSourceWebGL1;
  const juliaShaderSource = isWebGL2() ? juliaShaderSourceWebGL2 : juliaShaderSourceWebGL1;
  const mandelbrotSet = initialiseShadersHelper(
    "Mandelbrot",
    vertexShaderSource,
    mandelbrotShaderSource
  );
  const juliaSet = initialiseShadersHelper("Julia", vertexShaderSource, juliaShaderSource);
  fractalSets.set(C.FRACTAL_SET_ID_MANDELBROT, mandelbrotSet);
  fractalSets.set(C.FRACTAL_SET_ID_JULIA, juliaSet);
};

// Some or all configuration values are being changed.
const makeConfigurationChanges = ({
  fractalSetId,
  juliaConstant,
  colourMapId,
  maxIterations,
  regionBottomLeft,
  regionTopRight,
}) => {
  if (regionBottomLeft && regionTopRight) {
    performRegionUpdate(() => {
      region.set(regionBottomLeft, regionTopRight);
    });
  }

  if (Number.isInteger(fractalSetId)) {
    currentFractalSetId = fractalSetId;
    currentFractalSet = fractalSets.get(fractalSetId);
  }

  if (juliaConstant) {
    currentJuliaConstant = juliaConstant;
  }

  if (Number.isInteger(colourMapId)) {
    currentColourMapId = colourMapId;
    currentColourMap = colourMaps.get(colourMapId);
  }

  if (isWebGL2()) {
    if (Number.isInteger(maxIterations)) {
      currentMaxIterations = maxIterations;
    }
  }

  gl.useProgram(currentFractalSet.program);

  const modelViewMatrix = glm.mat4.fromScaling(glm.mat4.create(), [1, -1, 1]);
  gl.uniformMatrix4fv(currentFractalSet.uModelViewMatrix, false, modelViewMatrix);

  gl.uniform1i(currentFractalSet.uColourMap, currentColourMap.textureUnit);

  gl.uniform2f(currentFractalSet.uJuliaConstant, currentJuliaConstant.x, currentJuliaConstant.y);

  if (isWebGL2()) {
    gl.uniform1i(currentFractalSet.uMaxIterations, currentMaxIterations);
  }
};

const updateRegionPositionBuffer = () => {
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

const performRegionUpdate = (thunk) => {
  thunk();
  updateRegionPositionBuffer();
};

const render = () => {
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const displayConfiguration = async (configuration) => {
  switchToBookmark(configuration);
  panSpeedX = configuration.panSpeedX ?? U.randomPanSpeed();
  panSpeedY = configuration.panSpeedY ?? U.randomPanSpeed();
  zoomSpeed = configuration.zoomSpeed ?? U.randomZoomSpeed();

  const message = {
    type: "chooseConfiguration",
    fractalSetIds: Array.from(fractalSets.keys()),
    colourMapIds: Array.from(colourMaps.keys()),
  };
  const newConfiguration = await promiseWorker.postMessage(message);
  setTimeout(displayConfiguration, 10000, newConfiguration);
};

export const startGraphics = async (manualMode) => {
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

  initialiseWebGL(canvas);
  initialiseShaders();
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
    setCanvasAndViewportSize();
    render();
  } else {
    displayConfiguration(C.INITIAL_BOOKMARK);
    setCanvasAndViewportSize();
    const animate = () => {
      performRegionUpdate(() => {
        region.panX(panSpeedX);
        region.panY(panSpeedY);
        region.zoom(zoomSpeed);
      });
      render();
      requestAnimationFrame(animate);
    };
    animate();
  }
};

const setCanvasAndViewportSize = (explicitWidth, explicitHeight) => {
  const width = explicitWidth ?? canvas.clientWidth;
  const height = explicitHeight ?? canvas.clientHeight;

  if (!explicitWidth && !explicitHeight) {
    canvas.width = width;
    canvas.height = height;
  }

  gl.viewport(0, 0, width, height);

  performRegionUpdate(() => {
    region.adjustAspectRatio(width, height);
  });
};

const onWindowResize = () => {
  setCanvasAndViewportSize();
  render();
};

const onCanvasMouseDownHandler = (e) => {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;
  const { regionMouseX, regionMouseY } = region.mouseToRegion(canvas, mouseX, mouseY);

  if (e.shiftKey) {
    performRegionUpdate(() => {
      region.recentre(regionMouseX, regionMouseY);
    });
    return render();
  }

  if (e.altKey) {
    switch (currentFractalSetId) {
      case C.FRACTAL_SET_ID_MANDELBROT: {
        const juliaConstant = {
          x: regionMouseX,
          y: regionMouseY,
        };
        makeConfigurationChanges({
          fractalSetId: C.FRACTAL_SET_ID_JULIA,
          juliaConstant,
        });
        render();
        return;
      }

      case C.FRACTAL_SET_ID_JULIA:
        makeConfigurationChanges({ fractalSetId: C.FRACTAL_SET_ID_MANDELBROT });
        render();
        return;

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

  performRegionUpdate(() => {
    const mouseDeltaX = mouseX - lastMousePt.mouseX;
    const mouseDeltaY = mouseY - lastMousePt.mouseY;
    region.drag(canvas, mouseDeltaX, mouseDeltaY);
  });

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
    performRegionUpdate(() => {
      region.zoom(50);
    });
    render();
    return;
  }

  if (e.key === "-") {
    performRegionUpdate(() => {
      region.zoom(-100);
    });
    render();
    return;
  }

  if (e.key === "h" && e.ctrlKey) {
    switchToBookmark(C.HOME_BOOKMARK);
    setCanvasAndViewportSize();
    render();
    return;
  }

  if ((e.key === "c" || e.key === "C") && e.ctrlKey) {
    const keys = Array.from(colourMaps.keys());
    const maxIndex = keys.length;
    const oldIndex = keys.indexOf(currentColourMapId);
    const newIndex = (oldIndex + (e.shiftKey ? maxIndex - 1 : 1)) % maxIndex;
    const newColourMapId = keys[newIndex];
    makeConfigurationChanges({ colourMapId: newColourMapId });
    render();
    return;
  }

  if (isWebGL2()) {
    if (e.key === "i" || e.key === "I") {
      const delta = C.DELTA_ITERATIONS * (e.shiftKey ? -1 : +1);
      currentMaxIterations = U.clamp(
        C.MIN_ITERATIONS,
        C.MAX_ITERATIONS_MANUAL,
        currentMaxIterations + delta
      );
      makeConfigurationChanges({ maxIterations: currentMaxIterations });
      render();
      return;
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
