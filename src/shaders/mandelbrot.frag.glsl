#version 300 es
precision highp float;

uniform int uMaxIterations;
uniform sampler2D uColormap;
in vec2 vPosition;
out vec4 fragColor;

void main(void) {
  float cr = vPosition.x;
  float ci = vPosition.y;
  float zr = 0.0;
  float zi = 0.0;
  int divergesAt = uMaxIterations - 1;
  for (int iteration = 0; iteration < uMaxIterations; iteration++) {
    float zrNext = (zr * zr) - (zi * zi) + cr;
    float ziNext = (2.0 * zr * zi) + ci;
    zr = zrNext;
    zi = ziNext;
    if (zr * zr + zi * zi >= 4.0) {
      divergesAt = iteration;
      break;
    }
  }
  int index = 256 * divergesAt / uMaxIterations;
  fragColor = texelFetch(uColormap, ivec2(index, 0), 0);
}
