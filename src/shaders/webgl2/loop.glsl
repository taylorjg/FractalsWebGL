const int COLOUR_MAP_SIZE = 256;

uniform int uSmoothColouring;

vec4 loop(int maxIterations, sampler2D colourMap, vec2 z, vec2 c) {
  int iteration = 0;
  while (iteration < maxIterations) {
    if (dot(z, z) >= 4.0) break;
    vec2 zSquared = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    z = zSquared + c;
    iteration++;
  }

  float possiblySmoothedIteration = uSmoothColouring > 0
    ? float(iteration) - log(log(length(z))) / log(2.0)
    : float(iteration);

  float s = possiblySmoothedIteration / float(maxIterations);
  float t = 0.5;
  vec2 textureCoords = vec2(s, t);
  return texture(colourMap, textureCoords);
}
