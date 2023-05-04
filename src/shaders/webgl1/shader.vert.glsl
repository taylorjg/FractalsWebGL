precision highp float;

attribute vec2 aVertexPosition;
attribute vec2 aRegionPosition;
uniform mat4 uModelViewMatrix;
varying vec2 vRegionPosition;

void main(void) {
  gl_Position = uModelViewMatrix * vec4(aVertexPosition, 0, 1);
  vRegionPosition = aRegionPosition;
}
