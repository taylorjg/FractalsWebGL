// Same value as INITIAL_ITERATIONS in constants.js
const int MAX_ITERATIONS = 128;

vec4 loop(sampler2D colormap, vec2 z, vec2 c) {
  int iteration = MAX_ITERATIONS;
  for (int i = 0; i < MAX_ITERATIONS; i++) {
    if (dot(z, z) >= 4.0) {
      iteration = i;
      break;
    }
    vec2 zSquared = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    z = zSquared + c;
  }
  float s = float(iteration) / float(MAX_ITERATIONS + 1);
  float t = 0.0;
  vec2 coord = vec2(s, t);
  return texture2D(colormap, coord);
}
