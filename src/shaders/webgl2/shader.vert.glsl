#version 300 es
precision highp float;

in vec2 aVertexPosition;
uniform mat4 uModelViewMatrix;

void main(void) {
  gl_Position = uModelViewMatrix * vec4(aVertexPosition, 0, 1);
}
