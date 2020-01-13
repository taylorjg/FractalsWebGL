precision highp float;

uniform sampler2D uColormap;
varying vec2 vPosition;

void main(void) {
  const int MAX_ITERATIONS = 255;
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
  float s = float(divergesAt) / float(MAX_ITERATIONS + 1);
  float t = 0.0;
  gl_FragColor = texture2D(uColormap, vec2(s, t));
}
