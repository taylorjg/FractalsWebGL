precision highp float;

uniform vec4 uColormap[256];
uniform vec2 uJuliaConstant;
varying vec2 vPosition;

vec4 colourmapIndexer(int index) {
  for (int i = 0; i < 256; i++) {
    if (i == index) {
      return uColormap[i];
    }
  }
  return uColormap[0];
}

void main(void) {
  const int MAX_ITERATIONS = 120;
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
  int index = int(float(255) * float(divergesAt) / float(MAX_ITERATIONS));
  gl_FragColor = colourmapIndexer(index);
}
