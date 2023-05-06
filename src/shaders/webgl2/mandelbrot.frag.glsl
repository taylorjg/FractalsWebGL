#version 300 es
precision highp float;

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
out vec4 fragColor;

uniform vec2 uResolution;
uniform vec2 uRegionBottomLeft;
uniform vec2 uRegionTopRight;

void main(void) {
  vec2 z;

  vec2 dimensions = uRegionTopRight - uRegionBottomLeft;
  vec2 offset = dimensions * gl_FragCoord.xy / uResolution;
  offset.y = dimensions.y - offset.y;
  vec2 c = uRegionBottomLeft + offset;

  fragColor = loop(uMaxIterations, uColourMap, z, c);
}
