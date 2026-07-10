#version 300 es
precision highp float;

in vec2 aVertexPosition;
in vec2 aRegionPosition;
uniform mat4 uModelViewMatrix;
out vec2 vRegionPosition;

void main(void) {
  gl_Position = uModelViewMatrix * vec4(aVertexPosition, 0, 1);
  vRegionPosition = aRegionPosition;
}
