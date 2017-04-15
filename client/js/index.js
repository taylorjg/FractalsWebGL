import vertexShaderSource from '../shaders/shader.vert.glsl';
import fragmentShaderSource from '../shaders/shader.frag.glsl';
import { getColourMap } from './colourMaps';
import * as glm from 'gl-matrix';

let canvas;
let gl;
let aVertexPosition;
let aPlotPosition;
let uModelViewMatrix;
let uColormap;
let vertexPositionBuffer;

let bottomLeft = {
    x: -0.22,
    y: -0.7
};
let topRight = {
    x: -0.21,
    y: -0.69
};

const initGL = canvas => {
    try {
        gl = canvas.getContext('webgl');
    }
    catch (e) {
        console.error(`ERROR: ${e.message}`);
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
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

const initShaders = () => {
    const vertexShader = getShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = getShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Could not initialise shaders');
        return;
    }
    gl.useProgram(shaderProgram);
    aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(aVertexPosition);
    aPlotPosition = gl.getAttribLocation(shaderProgram, 'aPlotPosition');
    gl.enableVertexAttribArray(aPlotPosition);

    uModelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    const modelViewMatrix = glm.mat4.create();
    glm.mat4.fromScaling(modelViewMatrix, [1, -1, 1]);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

    uColormap = gl.getUniformLocation(shaderProgram, 'uColormap');
    const colourMap = getColourMap('jet');
    const flattenedColourMap = flatten(colourMap);
    gl.uniform4fv(uColormap, flattenedColourMap);
}

const initBuffers = () => {
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    const vertices = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 2;
    vertexPositionBuffer.numItems = 4;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(aVertexPosition, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
}

const render = () => {
    const plotPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, plotPositionBuffer);
    const baseCorners = [
        [topRight.x, topRight.y],
        [bottomLeft.x, topRight.y],
        [topRight.x, bottomLeft.y],
        [bottomLeft.x, bottomLeft.y]
    ];
    const corners = [];
    for (const i in baseCorners) {
        var x = baseCorners[i][0];
        var y = baseCorners[i][1];
        corners.push(x);
        corners.push(y);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPlotPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.deleteBuffer(plotPositionBuffer);
}

const start = () => {

    canvas = document.getElementById('canvas');
    canvas.addEventListener('mousedown', onCanvasMousedownHandler);
    window.addEventListener('resize', onWindowResize);

    initGL(canvas);
    initShaders()
    initBuffers();

    setCanvasAndViewportSize();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    render();
}

const flatten = xss => xss.reduce((acc, xs) => acc.concat(xs), []);

const setCanvasAndViewportSize = () => {

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const rw = topRight.x - bottomLeft.x;
    const rh = topRight.y - bottomLeft.y;

    canvas.width = cw;
    canvas.height = ch;
    gl.viewport(0, 0, cw, ch);

    if (cw > ch) {
        const rwNew = cw * rh / ch;
        const rwDelta = rwNew - rw;
        const rwDeltaHalf = rwDelta / 2;
        bottomLeft.x -= rwDeltaHalf;
        topRight.x += rwDeltaHalf;
    }

    if (cw < ch) {
        const rhNew = ch * rw / cw;
        const rhDelta = rhNew - rh;
        const rhDeltaHalf = rhDelta / 2;
        bottomLeft.y -= rhDeltaHalf;
        topRight.y += rhDeltaHalf;
    }
};

const onWindowResize = () => {
    setCanvasAndViewportSize();
    render();
};

const mouseToRegion = (mouseX, mouseY) => {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const rw = topRight.x - bottomLeft.x;
    const rh = topRight.y - bottomLeft.y;
    return {
        regionMouseX: bottomLeft.x + (mouseX * (rw / cw)),
        regionMouseY: bottomLeft.y + (mouseY * (rh / ch))
    };
};

const onCanvasMousedownHandler = ev => {

    ev.preventDefault();
    ev.stopPropagation();

    const mouseX = ev.offsetX;
    const mouseY = ev.offsetY;
    const { regionMouseX, regionMouseY } = mouseToRegion(mouseX, mouseY);

    const rw = topRight.x - bottomLeft.x;
    const rh = topRight.y - bottomLeft.y;

    if (ev.altKey) {
        // Re-centre.
        const rcx = bottomLeft.x + rw / 2;
        const rcy = bottomLeft.y + rh / 2;
        const drcx = regionMouseX - rcx;
        const drcy = regionMouseY - rcy;
        bottomLeft.x += drcx;
        bottomLeft.y += drcy;
        topRight.x += drcx;
        topRight.y += drcy;
    }
    else {
        if (ev.shiftKey) {
            // Zoom out
            const drw = rw / 2;
            const drh = rh / 2;
            bottomLeft.x -= drw;
            bottomLeft.y -= drh;
            topRight.x += drw;
            topRight.y += drh;
        }
        else {
            // Zoom in
            const drw = rw / 4;
            const drh = rh / 4;
            bottomLeft.x += drw;
            bottomLeft.y += drh;
            topRight.x -= drw;
            topRight.y -= drh;
        }
    }

    render();
};

start();
