import vertexShaderSource from './shader.vert.glsl';
import fragmentShaderSource from './shader.frag.glsl';

let gl;
let aVertexPosition;
let aPlotPosition;
let vertexPositionBuffer;

const initGL = canvas => {
    try {
        gl = canvas.getContext('webgl');
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
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
}

const drawScene = () => {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(aVertexPosition, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    const plotPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, plotPositionBuffer);

    const baseCorners = [
        [0.7, 1.2],
        [-2.2, 1.2],
        [0.7, -1.2],
        [-2.2, -1.2]
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
    gl.deleteBuffer(plotPositionBuffer)
}

const start = () => {
    var canvas = document.getElementById('canvas');
    initGL(canvas);
    initShaders()
    initBuffers();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    drawScene();
}

start();
