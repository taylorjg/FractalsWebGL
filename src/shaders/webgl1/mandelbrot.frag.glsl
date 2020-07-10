precision highp float;

@import ./common;

uniform sampler2D uColormap;
varying vec2 vPosition;

void main(void) {
  vec2 z;
  vec2 c = vPosition;
  gl_FragColor = loop(uColormap, z, c);
}
