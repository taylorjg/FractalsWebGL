#version 300 es
precision highp float;

// INSERT-COMMON-CODE-HERE

uniform int uMaxIterations;
uniform sampler2D uColourMap;
out vec4 fragColor;

void main(void) {
  vec4 zDs = vec4(ds_set(0.0), ds_set(0.0));
  vec4 cDs = interpolateRegionDs();
  fragColor = loopDs(uMaxIterations, uColourMap, zDs, cDs);
}
