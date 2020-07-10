#version 300 es
precision highp float;

@import ./common;

uniform int uMaxIterations;
uniform sampler2D uColormap;
uniform vec2 uJuliaConstant;
in vec2 vPosition;
out vec4 fragColor;

void main(void) {
  vec2 z = vPosition;
  vec2 c = uJuliaConstant;
  fragColor = loop(uMaxIterations, uColormap, z, c);
}
