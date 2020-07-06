#version 300 es
precision highp float;

@import ./common;

uniform int uMaxIterations;
uniform sampler2D uColormap;
in vec2 vPosition;
out vec4 fragColor;

void main(void) {
  vec2 z = vec2(0, 0);
  vec2 c = vPosition;
  fragColor = loop(uMaxIterations, uColormap, z, c);
}
