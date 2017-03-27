precision mediump float;

varying vec2 vPosition;

void main(void) {
  float cx = vPosition.x;
  float cy = vPosition.y;
  float x = 0.0;
  float y = 0.0;
  int runaway = 0;
  for (int i = 0; i < 120; i++) {
    float tempX = x * x - y * y + float(cx);
    y = 2.0 * x * y + float(cy);
    x = tempX;
    if (runaway == 0 && x * x + y * y > 4.0) {
      runaway = i;
    }
  }

  if (runaway != 0) {
    float hue = float(runaway) / 200.0;
    float saturation = 0.6;
    float hueRound = hue * 6.0;
    int hueIndex = int(mod(float(int(hueRound)), 6.0));
    float f = fract(hueRound);
    float value = 1.0;
    float p = value * (1.0 - saturation);
    float q = value * (1.0 - f * saturation);
    float t = value * (1.0 - (1.0 - f) * saturation);

    if (hueIndex == 0)
      gl_FragColor = vec4(value, t, p, 1.0);
    else if (hueIndex == 1)
      gl_FragColor = vec4(q, value, p, 1.0);
    else if (hueIndex == 2)
      gl_FragColor = vec4(p, value, t, 1.0);
    else if (hueIndex == 3)
      gl_FragColor = vec4(p, q, value, 1.0);
    else if (hueIndex == 4)
      gl_FragColor = vec4(t, p, value, 1.0);
    else if (hueIndex == 5)
      gl_FragColor = vec4(value, p, q, 1.0);
  }
  else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}
