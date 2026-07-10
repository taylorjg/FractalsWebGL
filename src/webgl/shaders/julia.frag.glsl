#version 300 es
precision highp float;

// INSERT-COMMON-CODE-HERE

uniform int uMaxIterations;
uniform sampler2D uColourMap;
uniform vec2 uJuliaConstant;
in vec2 vRegionPosition;
out vec4 fragColor;

void main(void) {
  vec2 z = vRegionPosition;
  vec2 c = uJuliaConstant;
  fragColor = loop(uMaxIterations, uColourMap, z, c);
}
