precision highp float;

// INSERT-COMMON-CODE-HERE

uniform sampler2D uColourMap;

void main(void) {
  vec2 z;
  vec2 c = interpolateRegion();
  gl_FragColor = loop(uColourMap, z, c);
}
