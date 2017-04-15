precision highp float;

uniform vec4 uColormap[256];
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
  float cx = vPosition.x;
  float cy = vPosition.y;
  float x = 0.0;
  float y = 0.0;
  int divergesAt = MAX_ITERATIONS;
  for (int i = 0; i < MAX_ITERATIONS; i++) {
    float tempX = x * x - y * y + cx;
    y = 2.0 * x * y + cy;
    x = tempX;
    if (x * x + y * y > 4.0) {
      divergesAt = i;
      break;
    }
  }
  int index = int(float(255) * float(divergesAt) / float(MAX_ITERATIONS));
  gl_FragColor = colourmapIndexer(index);
}
