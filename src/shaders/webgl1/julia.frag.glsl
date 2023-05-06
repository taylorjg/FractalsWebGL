precision highp float;

// INSERT-COMMON-CODE-HERE

uniform sampler2D uColourMap;
uniform vec2 uJuliaConstant;
varying vec2 vRegionPosition;

void main(void) {
  vec2 z = vRegionPosition;
  vec2 c = uJuliaConstant;
  gl_FragColor = loop(uColourMap, z, c);
}
