precision highp float;

attribute vec2 aVertexPosition;
attribute vec2 aPlotPosition;
uniform mat4 uModelViewMatrix;
uniform vec2 uJuliaConstant;
varying vec2 vPosition;

void main(void) {
    gl_Position = uModelViewMatrix * vec4(aVertexPosition, 1.0, 1.0);
    vPosition = aPlotPosition;
}
