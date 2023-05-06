#version 300 es
precision highp float;

// INSERT-COMMON-CODE-HERE

uniform int uMaxIterations;
uniform sampler2D uColourMap;
out vec4 fragColor;

void main(void) {
  vec2 z;
  vec2 c = interpolateRegion();
  fragColor = loop(uMaxIterations, uColourMap, z, c);
}
