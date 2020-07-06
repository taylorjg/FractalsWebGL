vec4 loop(int maxIterations, sampler2D colormap, vec2 z, vec2 c) {
  int iteration = 0;
  while (iteration < maxIterations) {
    if (dot(z, z) >= 4.0) break;
    vec2 zSquared = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
    z = zSquared + c;
    iteration++;
  }
  int index = 255 * iteration / maxIterations;
  return texelFetch(colormap, ivec2(index, 0), 0);
}
