import vertexShaderSource from '../shaders/shader.vert.glsl';
import fragmentShaderSource from '../shaders/shader.frag.glsl';
import { getColourMap } from './colourMaps';
import * as glm from 'gl-matrix';

let gl;
let aVertexPosition;
let aPlotPosition;
let uModelViewMatrix;
let uColormap;
let vertexPositionBuffer;
// let rubberbanding = false;
// let rubberbandingStartMouseX;
// let rubberbandingStartMouseY;

let canvasWidth;
let canvasHeight;
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
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        gl.viewportWidth = canvasWidth;
        gl.viewportHeight = canvasHeight;
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
    // const colourMap = getColourMap('monochrome');
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
    var canvas = document.getElementById('canvas');
    canvas.addEventListener('mousedown', onMousedownHandler);
    // canvas.addEventListener('mouseup', onMouseupHandler);
    initGL(canvas);
    initShaders()
    initBuffers();
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    render();
}

const flatten = xss => xss.reduce((acc, xs) => acc.concat(xs), []);

const onMousedownHandler = ev => {

    const mouseX = ev.offsetX;
    const mouseY = ev.offsetY;

    if (ev.shiftKey) {

        const regionMouse = mouseToRegion(mouseX, mouseY);
        const regionMouseX = regionMouse.x;
        const regionMouseY = regionMouse.y;

        const regionWidth = topRight.x - bottomLeft.x;
        const regionHeight = topRight.y - bottomLeft.y;
        console.log(`regionWidth: ${regionWidth}; regionHeight: ${regionHeight}`);
        const regionCentreX = bottomLeft.x + regionWidth / 2;
        const regionCentreY = bottomLeft.y + regionHeight / 2;

        const dx = regionMouseX - regionCentreX;
        const dy = regionMouseY - regionCentreY;

        bottomLeft.x += dx;
        bottomLeft.y += dy;
        topRight.x += dx;
        topRight.y += dy;

        render();
    }
    // else {
    //     rubberbanding = true;
    //     rubberbandingStartMouseX = mouseX;
    //     rubberbandingStartMouseY = mouseY;
    // }
};

// const onMouseupHandler = ev => {
//     if (rubberbanding) {
//         rubberbanding = false;
//         const rubberbandingEndMouseX = ev.offsetX;
//         const rubberbandingEndMouseY = ev.offsetY;
//         const bottomLeftMouseX = Math.min(rubberbandingStartMouseX, rubberbandingEndMouseX);
//         const bottomLeftMouseY = Math.min(rubberbandingStartMouseY, rubberbandingEndMouseY);
//         const topRightMouseX = Math.max(rubberbandingStartMouseX, rubberbandingEndMouseX);
//         const topRightMouseY = Math.max(rubberbandingStartMouseY, rubberbandingEndMouseY);
//         bottomLeft = mouseToRegion(bottomLeftMouseX, bottomLeftMouseY);
//         topRight = mouseToRegion(topRightMouseX, topRightMouseY);
//         render();
//     }
// };

const mouseToRegion = (mouseX, mouseY) => {
    const regionWidth = topRight.x - bottomLeft.x;
    const regionHeight = topRight.y - bottomLeft.y;
    const regionMouseX = mouseX * (regionWidth / canvasWidth) + bottomLeft.x;
    const regionMouseY = mouseY * (regionHeight / canvasHeight) + bottomLeft.y;
    return {
        x: regionMouseX,
        y: regionMouseY
    };
};

start();
