#version 300 es
precision highp float;

in vec2 aVertexPosition;
uniform mat4 uModelViewMatrix;
uniform vec2 uRegionCentre;
uniform vec2 uRegionHalfSize;
out vec2 vRegionPosition;

void main(void) {
  gl_Position = uModelViewMatrix * vec4(aVertexPosition, 0, 1);
  vRegionPosition = uRegionCentre + aVertexPosition * uRegionHalfSize;
}
