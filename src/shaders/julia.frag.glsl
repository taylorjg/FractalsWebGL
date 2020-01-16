#version 300 es
precision highp float;

uniform int uMaxIterations;
uniform sampler2D uColormap;
uniform vec2 uJuliaConstant;
in vec2 vPosition;
out vec4 fragColor;

void main(void) {
  float cr = uJuliaConstant.x;
  float ci = uJuliaConstant.y;
  float zr = vPosition.x;
  float zi = vPosition.y;
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
