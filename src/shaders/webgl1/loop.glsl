// Same value as INITIAL_ITERATIONS in constants.js
const int MAX_ITERATIONS = 128;

const int COLOUR_MAP_SIZE = 256;

vec4 loop(sampler2D colourMap, vec2 z, vec2 c) {
  int iteration = MAX_ITERATIONS;
  for (int i = 0; i < MAX_ITERATIONS; i++) {
    if (dot(z, z) >= 4.0) {
      iteration = i;
      break;
    }
    vec2 zSquared = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    z = zSquared + c;
  }

  for (int i = 0; i < 2; i++) {
    vec2 zSquared = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    z = zSquared + c;
    iteration++;
  }

  // http://linas.org/art-gallery/escape/escape.html
  float smoothedIteration = float(iteration) - log(log(length(z))) / log(2.0);

  float s = smoothedIteration / float(MAX_ITERATIONS);
  float t = 0.5;
  vec2 textureCoords = vec2(s, t);
  return texture2D(colourMap, textureCoords);
}
