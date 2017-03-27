import vertexShaderSource from './shader.vert.glsl';
import fragmentShaderSource from './shader.frag.glsl';

var gl;
var aVertexPosition;
var aPlotPosition;
var shaderProgram;
var aVertexPosition;
var centerOffsetX = 0;
var centerOffsetY = 0;
var zoom;
var zoomCenterX;
var zoomCenterY;
var vertexPositionBuffer;
var baseCorners = [
    [0.7, 1.2],
    [-2.2, 1.2],
    [0.7, -1.2],
    [-2.2, -1.2],
];

function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function getShader(gl, source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function initShaders() {

    var fragmentShader = getShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    var vertexShader = getShader(gl, vertexShaderSource, gl.VERTEX_SHADER);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(aVertexPosition);

    aPlotPosition = gl.getAttribLocation(shaderProgram, "aPlotPosition");
    gl.enableVertexAttribArray(aPlotPosition);
}

function initBuffers() {
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    var vertices = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 2;
    vertexPositionBuffer.numItems = 4;
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(aVertexPosition, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    var plotPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, plotPositionBuffer);
    var cornerIx;
    var corners = [];
    for (cornerIx in baseCorners) {
        var x = baseCorners[cornerIx][0];
        var y = baseCorners[cornerIx][1];
        corners.push(x / zoom + centerOffsetX);
        corners.push(y / zoom + centerOffsetY);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPlotPosition, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.deleteBuffer(plotPositionBuffer)
}

function resetZoom() {
    zoom = 1.0;
    zoomCenterX = 0.28693186889504513;
    zoomCenterY = 0.014286693904085048;
}

function webGLStart() {
    resetZoom();
    var canvas = document.getElementById("canvas");
    initGL(canvas);
    initShaders()
    initBuffers();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    drawScene();
}

webGLStart();
