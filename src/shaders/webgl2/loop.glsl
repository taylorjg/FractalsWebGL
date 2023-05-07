const int COLOUR_MAP_SIZE = 256;

vec4 loop(int maxIterations, sampler2D colourMap, vec2 z, vec2 c) {
  int iteration = 0;
  while (iteration < maxIterations) {
    if (dot(z, z) >= 4.0) break;
    vec2 zSquared = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    z = zSquared + c;
    iteration++;
  }

  int s = (COLOUR_MAP_SIZE - 1) * iteration / maxIterations;
  int t = 0;
  ivec2 textureCoords = ivec2(s, t);
  int levelOfDetail = 0;
  return texelFetch(colourMap, textureCoords, levelOfDetail);
}
