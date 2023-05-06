precision highp float;

// INSERT-COMMON-CODE-HERE

uniform sampler2D uColourMap;
uniform vec2 uJuliaConstant;

void main(void) {
  vec2 z = interpolateRegion();
  vec2 c = uJuliaConstant;
  gl_FragColor = loop(uColourMap, z, c);
}
