vec4 loop(int maxIterations, sampler2D colourMap, vec2 z, vec2 c) {
  int iteration = 0;
  while (iteration < maxIterations) {
    if (dot(z, z) >= 4.0) break;
    vec2 zSquared = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    z = zSquared + c;
    iteration++;
  }
  int s = 255 * iteration / maxIterations;
  int t = 0;
  ivec2 coord = ivec2(s, t);
  int lod = 0;
  return texelFetch(colourMap, coord, lod);
}
