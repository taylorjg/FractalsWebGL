import vertexShaderSource from '../shaders/shader.vert.glsl';
import mandelbrotShaderSource from '../shaders/mandelbrot.frag.glsl';
import juliaShaderSource from '../shaders/julia.frag.glsl';
import { getColourMap } from './colourMaps';
import * as glm from 'gl-matrix';

const MAX_ITERATIONS = 120;

let canvas;
let gl;
let mandelbrotSet = {};
let juliaSet = {};
let colourMaps = [
    { name: 'jet', colourMap: getColourMap('jet') },
    { name: 'gist_stern', colourMap: getColourMap('gist_stern') },
    { name: 'ocean', colourMap: getColourMap('ocean') },
    { name: 'rainbow', colourMap: getColourMap('rainbow') },
    { name: 'monochrome', colourMap: getColourMap('monochrome') }
];
let currentFractalSet = undefined
let currentJuliaConstant = undefined;
let currentColourMapIndex = undefined;
let panning = false;
let lastMousePt;
let bookmarkMode = false;
let nextBookmarkId = 0;
let bookmarks = new Map();

let regionBottomLeft = {
    x: -0.22,
    y: -0.7
};
let regionTopRight = {
    x: -0.21,
    y: -0.69
};

const initGL = canvas => {
    try {
        gl = canvas.getContext('webgl');
    }
    catch (e) {
        console.error(`canvas.getContext(webgl) failed: ${e.message}`);
    }
    if (!gl) {
        console.error('Failed to initialise WebGL');
    }
};

const getShader = (gl, source, shaderType) => {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(shader)
        console.error(`Failed to compile shader: ${errorMessage}`);
        return null;
    }
    return shader;
}

const initShadersHelper = (name, fractalSet, fragmentShaderSource) => {

    const vertexShader = getShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = getShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const errorMessage = gl.getProgramInfoLog(program);
        console.error(`Could not initialise shaders: ${errorMessage}`);
        return;
    }

    const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(aVertexPosition);

    const aPlotPosition = gl.getAttribLocation(program, 'aPlotPosition');
    gl.enableVertexAttribArray(aPlotPosition);

    const uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix');
    const uColormap = gl.getUniformLocation(program, 'uColormap');
    const uJuliaConstant = gl.getUniformLocation(program, 'uJuliaConstant');

    const vertices = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];
    const vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);

    fractalSet.name = name;
    fractalSet.program = program;
    fractalSet.aVertexPosition = aVertexPosition;
    fractalSet.aPlotPosition = aPlotPosition;
    fractalSet.uModelViewMatrix = uModelViewMatrix;
    fractalSet.uColormap = uColormap;
    fractalSet.uJuliaConstant = uJuliaConstant;
    fractalSet.vertexPositionBuffer = vertexPositionBuffer;
};

const initShaders = () => {
    initShadersHelper('Mandelbrot', mandelbrotSet, mandelbrotShaderSource);
    initShadersHelper('Julia', juliaSet, juliaShaderSource);
    setCurrentFractalSet(mandelbrotSet, { x: 0, y: 0 }, 0);
};

const setCurrentFractalSet = (fractalSet, juliaConstant, colourMapIndex) => {

    currentFractalSet = fractalSet || currentFractalSet;
    currentJuliaConstant = juliaConstant || currentJuliaConstant;
    currentColourMapIndex = Number.isInteger(colourMapIndex) ? colourMapIndex : currentColourMapIndex;

    gl.useProgram(currentFractalSet.program);

    const modelViewMatrix = glm.mat4.create();
    glm.mat4.fromScaling(modelViewMatrix, [1, -1, 1]);
    gl.uniformMatrix4fv(currentFractalSet.uModelViewMatrix, false, modelViewMatrix);

    gl.uniform4fv(currentFractalSet.uColormap, colourMaps[currentColourMapIndex].colourMap);

    gl.uniform2f(currentFractalSet.uJuliaConstant, currentJuliaConstant.x, currentJuliaConstant.y);
};

const render = () => {
    const baseCorners = [
        [regionTopRight.x, regionTopRight.y],
        [regionBottomLeft.x, regionTopRight.y],
        [regionTopRight.x, regionBottomLeft.y],
        [regionBottomLeft.x, regionBottomLeft.y]
    ];
    const corners = [];
    for (const index in baseCorners) {
        const x = baseCorners[index][0];
        const y = baseCorners[index][1];
        corners.push(x);
        corners.push(y);
    }
    const plotPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, plotPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);
    gl.vertexAttribPointer(currentFractalSet.aPlotPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.deleteBuffer(plotPositionBuffer);
}

const start = () => {

    canvas = document.getElementById('canvas');
    canvas.addEventListener('mousedown', onCanvasMouseDownHandler);
    canvas.addEventListener('mousemove', onCanvasMouseMoveHandler);
    canvas.addEventListener('mouseup', onCanvasMouseUpHandler);
    canvas.addEventListener('mouseleave', onCanvasMouseLeaveHandler);
    document.addEventListener('keydown', onDocumentKeyDownHandler);
    window.addEventListener('resize', onWindowResize);

    initGL(canvas);
    initShaders()
    setCanvasAndViewportSize();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    render();

    if (bookmarks.size === 0) {
        const defaultBookmark = {
            id: 0,
            name: 'Default',
            fractalSet: mandelbrotSet,
            juliaConstant: { x: 0, y: 0 },
            colourMapIndex: 0,
            regionBottomLeft: {x: -2.25, y: -1.5 },
            regionTopRight: { x: 0.75, y: 1.5 },
            maxIterations: MAX_ITERATIONS
        };
        bookmarks.set(defaultBookmark.id, defaultBookmark);
        nextBookmarkId = 1;
    }
}

const setCanvasAndViewportSize = () => {

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const rw = regionTopRight.x - regionBottomLeft.x;
    const rh = regionTopRight.y - regionBottomLeft.y;

    canvas.width = cw;
    canvas.height = ch;
    gl.viewport(0, 0, cw, ch);

    if (cw > ch) {
        const rwNew = cw * rh / ch;
        const rwDelta = rwNew - rw;
        const rwDeltaHalf = rwDelta / 2;
        regionBottomLeft.x -= rwDeltaHalf;
        regionTopRight.x += rwDeltaHalf;
    }

    if (cw < ch) {
        const rhNew = ch * rw / cw;
        const rhDelta = rhNew - rh;
        const rhDeltaHalf = rhDelta / 2;
        regionBottomLeft.y -= rhDeltaHalf;
        regionTopRight.y += rhDeltaHalf;
    }
};

const onWindowResize = () => {
    setCanvasAndViewportSize();
    render();
};

const mouseToRegion = (mouseX, mouseY) => {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const rw = regionTopRight.x - regionBottomLeft.x;
    const rh = regionTopRight.y - regionBottomLeft.y;
    return {
        regionMouseX: regionBottomLeft.x + (mouseX * (rw / cw)),
        regionMouseY: regionBottomLeft.y + (mouseY * (rh / ch))
    };
};

const onCanvasMouseDownHandler = ev => {

    const mouseX = ev.offsetX;
    const mouseY = ev.offsetY;
    const { regionMouseX, regionMouseY } = mouseToRegion(mouseX, mouseY);

    if (ev.shiftKey) {
        const rw = regionTopRight.x - regionBottomLeft.x;
        const rh = regionTopRight.y - regionBottomLeft.y;
        const rcx = regionBottomLeft.x + rw / 2;
        const rcy = regionBottomLeft.y + rh / 2;
        const drcx = regionMouseX - rcx;
        const drcy = regionMouseY - rcy;
        regionBottomLeft.x += drcx;
        regionBottomLeft.y += drcy;
        regionTopRight.x += drcx;
        regionTopRight.y += drcy;
        render();
        return;
    }

    if (ev.altKey) {
        switch (currentFractalSet) {
            case mandelbrotSet:
                setCurrentFractalSet(juliaSet, { x: regionMouseX, y: regionMouseY });
                render();
                break;

            case juliaSet:
                setCurrentFractalSet(mandelbrotSet);
                render();
                break;

            default:
                break;
        }
        return;
    }

    panning = true;
    lastMousePt = { mouseX, mouseY };
};

const onCanvasMouseMoveHandler = ev => {

    if (!panning) {
        return;
    }

    const mouseX = ev.offsetX;
    const mouseY = ev.offsetY;
    const mouseDx = mouseX - lastMousePt.mouseX;
    const mouseDy = mouseY - lastMousePt.mouseY;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const rw = regionTopRight.x - regionBottomLeft.x;
    const rh = regionTopRight.y - regionBottomLeft.y;

    const regionDx = mouseDx * rw / cw;
    const regionDy = mouseDy * rh / ch;

    regionBottomLeft.x -= regionDx;
    regionBottomLeft.y -= regionDy;
    regionTopRight.x -= regionDx;
    regionTopRight.y -= regionDy;

    render();

    lastMousePt = { mouseX, mouseY };
};

const onCanvasMouseUpHandler = () => {
    panning = false;
};

const onCanvasMouseLeaveHandler = () => {
    panning = false;
};

const onDocumentKeyDownHandler = ev => {

    if (bookmarkMode) {
        handleBookmarkKeys(ev);
        return;
    }

    if (!bookmarkMode && ev.key === 'b' && ev.ctrlKey) {
        bookmarkMode = true;
        return;
    }

    const rw = regionTopRight.x - regionBottomLeft.x;
    const rh = regionTopRight.y - regionBottomLeft.y;

    if (ev.key === '+') {
        // Zoom in
        const drw = rw / 4;
        const drh = rh / 4;
        regionBottomLeft.x += drw;
        regionBottomLeft.y += drh;
        regionTopRight.x -= drw;
        regionTopRight.y -= drh;
        render();
        return;
    }

    if (ev.key === '-') {
        // Zoom out
        const drw = rw / 2;
        const drh = rh / 2;
        regionBottomLeft.x -= drw;
        regionBottomLeft.y -= drh;
        regionTopRight.x += drw;
        regionTopRight.y += drh;
        render();
        return;
    }

    if (ev.key === 'h' && ev.ctrlKey) {
        // Reset
        switchToBookmark(bookmarks.get(0));
        return;
    }

    if ((ev.key === 'c' || ev.key === 'C') && ev.ctrlKey) {
        const max = colourMaps.length;
        const colourMapIndex = (currentColourMapIndex + (ev.shiftKey ? max - 1 : 1)) % max;
        setCurrentFractalSet(undefined, undefined, colourMapIndex);
        render();
        return;
    }
};

const handleBookmarkKeys = ev => {

    bookmarkMode = false;

    if (ev.key === 'n') {
        const bookmark = createBookmark();
        presentBookmarkModal(bookmark);
        return;
    }

    if (ev.key === 'l') {
        presentManageBookmarksModal();
        return;
    }
};

const presentBookmarkModal = bookmark => {

    const hasId = Number.isInteger(bookmark.id);

    const modal = $('#bookmarkModal');

    const title = hasId ? 'Edit Bookmark' : 'New Bookmark';
    $('h4', modal).text(title);

    $('button.btn-primary', modal)
        .off('click')
        .on('click', () => {
            bookmark.name = $('#name', modal).val();
            if (!hasId) {
                bookmark.id = nextBookmarkId++;
                bookmarks.set(bookmark.id, bookmark);
            }
            modal.modal('hide');
        });

    modal
        .modal()
        .on('shown.bs.modal', () => {
            $('#name', modal).val(bookmark.name);
            $('#fractalSetName', modal).val(bookmark.fractalSet.name);
            $('#juliaConstant', modal).val(`(${bookmark.juliaConstant.x}, ${bookmark.juliaConstant.y})`);
            $('#colourMapName', modal).val(colourMaps[bookmark.colourMapIndex].name);
            $('#regionBottomLeft', modal).val(`(${bookmark.regionBottomLeft.x}, ${bookmark.regionBottomLeft.y})`);
            $('#regionTopRight', modal).val(`(${bookmark.regionTopRight.x}, ${bookmark.regionTopRight.y})`);
        });
};

const presentManageBookmarksModal = () => {

    const modal = $('#manageBookmarksModal');

    modal
        .modal()
        .on('shown.bs.modal', () => {
            const tbody = $('tbody', modal).empty();
            bookmarks.forEach(bookmark => {
                const switchToButton = $('<button>', {
                    'class': 'btn btn-sm btn-primary',
                    html: 'Switch To'
                });
                const editButtonAttributes = {
                    'class': 'btn btn-sm btn-default',
                    html: 'Edit'
                };
                const deleteButtonAttributes = {
                    'class': 'btn btn-sm btn-danger',
                    html: 'Delete'
                };
                if (bookmark.id === 0) {
                    editButtonAttributes.disabled = '';
                    deleteButtonAttributes.disabled = '';
                }
                const editButton = $('<button>', editButtonAttributes);
                const deleteButton = $('<button>', deleteButtonAttributes);
                switchToButton.on('click', invokeWithBookmark(onSwitchTo));
                editButton.on('click', invokeWithBookmark(onEdit));
                deleteButton.on('click', invokeWithBookmark(onDelete));
                const tr = $('<tr>', { 'data-id': bookmark.id });
                tr.append($('<td>', { html: bookmark.name }));
                tr.append($('<td>', { html: switchToButton }));
                tr.append($('<td>', { html: editButton }));
                tr.append($('<td>', { html: deleteButton }));
                tbody.append(tr);
            });
        });

    function invokeWithBookmark(fn) {
        return function () {
            modal.modal('hide');
            const tr = $(this).closest('tr');
            const id = Number(tr.attr('data-id'));
            const bookmark = bookmarks.get(id);
            fn(bookmark);
        }
    }

    const onSwitchTo = bookmark => switchToBookmark(bookmark);
    const onEdit = bookmark => presentBookmarkModal(bookmark);
    const onDelete = bookmark => bookmarks.delete(bookmark.id);
};

const createBookmark = name => ({
    name: name || `Bookmark${nextBookmarkId}`,
    fractalSet: currentFractalSet,
    juliaConstant: Object.assign({}, currentJuliaConstant),
    colourMapIndex: currentColourMapIndex,
    regionBottomLeft: Object.assign({}, regionBottomLeft),
    regionTopRight: Object.assign({}, regionTopRight),
    maxIterations: MAX_ITERATIONS
});

const switchToBookmark = bookmark => {
    setCurrentFractalSet(bookmark.fractalSet, bookmark.juliaConstant, bookmark.colourMapIndex);
    regionBottomLeft.x = bookmark.regionBottomLeft.x;
    regionBottomLeft.y = bookmark.regionBottomLeft.y;
    regionTopRight.x = bookmark.regionTopRight.x;
    regionTopRight.y = bookmark.regionTopRight.y;
    setCanvasAndViewportSize();
    render();
};

start();
