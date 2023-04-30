#version 300 es
precision highp float;

// Can't use @import anymore - I think it was a feature of the following
// package which I am no longer using:
// https://www.npmjs.com/package/webpack-glsl-loader
// @import ./common;

vec4 loop(int maxIterations, sampler2D colourMap, vec2 z, vec2 c) {
  int iteration = 0;
  while (iteration < maxIterations) {
    if (dot(z, z) >= 4.0) break;
    vec2 zSquared = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    z = zSquared + c;
    iteration++;
  }
  int s = 255 * iteration / maxIterations;
  int t = 0;
  ivec2 coord = ivec2(s, t);
  int lod = 0;
  return texelFetch(colourMap, coord, lod);
}

uniform int uMaxIterations;
uniform sampler2D uColourMap;
uniform vec2 uJuliaConstant;
in vec2 vPosition;
out vec4 fragColor;

void main(void) {
  vec2 z = vPosition;
  vec2 c = uJuliaConstant;
  fragColor = loop(uMaxIterations, uColourMap, z, c);
}
