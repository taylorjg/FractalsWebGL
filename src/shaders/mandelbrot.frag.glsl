#version 300 es
precision highp float;

uniform sampler2D uColormap;
in vec2 vPosition;
out vec4 fragColor;

const int MAX_ITERATIONS = 255;

void main(void) {
  float cr = vPosition.x;
  float ci = vPosition.y;
  float zr = 0.0;
  float zi = 0.0;
  int divergesAt = MAX_ITERATIONS;
  for (int iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    float zrNext = (zr * zr) - (zi * zi) + cr;
    float ziNext = (2.0 * zr * zi) + ci;
    zr = zrNext;
    zi = ziNext;
    if (zr * zr + zi * zi >= 4.0) {
      divergesAt = iteration;
      break;
    }
  }
  fragColor = texelFetch(uColormap, ivec2(divergesAt, 0), 0);
}