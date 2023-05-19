// Same value as INITIAL_ITERATIONS in constants.js
const int MAX_ITERATIONS = 128;

const int COLOUR_MAP_SIZE = 256;

uniform int uSmoothColouring;
uniform int uReturnIteration;

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

  if (uReturnIteration > 0) {

    // https://stackoverflow.com/questions/36575457/opengl-es-glsl-bitwise-operations-equivalents
    int hi = int(floor(float(iteration) / 256.0));
    int lo = iteration - (hi * 256);

    float hif = float(hi) / 255.0;
    float lof = float(lo) / 255.0;
    return vec4(lof, hif, 0.0, 1.0);
  } else {
    // http://linas.org/art-gallery/escape/escape.html
    float possiblySmoothedIteration = uSmoothColouring > 0
      ? float(iteration) - clamp(log(log(length(z))) / log(2.0), -1.0, 1.0)
      : float(iteration);

    float s = possiblySmoothedIteration / float(MAX_ITERATIONS);
    float t = 0.5;
    vec2 textureCoords = vec2(s, t);
    return texture2D(colourMap, textureCoords);
  }
}
