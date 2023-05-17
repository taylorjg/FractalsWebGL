const int COLOUR_MAP_SIZE = 256;

uniform int uSmoothColouring;
uniform int uReturnIteration;

vec4 loop(int maxIterations, sampler2D colourMap, vec2 z, vec2 c) {
  int iteration = 0;
  while (iteration < maxIterations) {
    if (dot(z, z) >= 4.0) break;
    vec2 zSquared = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    z = zSquared + c;
    iteration++;
  }

  if (uReturnIteration > 0) {
    int hi = (iteration & 0xff00) >> 8;
    int lo = iteration & 0xff;
    float hif = float(hi) / 255.0;
    float lof = float(lo) / 255.0;
    return vec4(lof, hif, 0.0, 1.0);
  } else {
    float possiblySmoothedIteration = uSmoothColouring > 0
      ? float(iteration) - clamp(log(log(length(z))) / log(2.0), -1.0, 1.0)
      : float(iteration);

    float s = possiblySmoothedIteration / float(maxIterations);
    float t = 0.5;
    vec2 textureCoords = vec2(s, t);
    return texture(colourMap, textureCoords);
  }
}
