precision highp float;

// INSERT-COMMON-CODE-HERE

uniform sampler2D uColourMap;
varying vec2 vRegionPosition;

void main(void) {
  vec2 z;
  vec2 c = vRegionPosition;
  gl_FragColor = loop(uColourMap, z, c);
}
