precision highp float;

@import ./common;

uniform sampler2D uColormap;
uniform vec2 uJuliaConstant;
varying vec2 vPosition;

void main(void) {
  vec2 z = vPosition;
  vec2 c = uJuliaConstant;
  gl_FragColor = loop(uColormap, z, c);
}
