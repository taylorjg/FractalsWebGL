#version 300 es
precision highp float;

in vec2 aVertexPosition;
in vec2 aPlotPosition;
uniform mat4 uModelViewMatrix;
out vec2 vPosition;

void main(void) {
  gl_Position = uModelViewMatrix * vec4(aVertexPosition, 0, 1);
  vPosition = aPlotPosition;
}
