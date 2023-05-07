vec4 loopDs(int maxIterations, sampler2D colourMap, vec4 zDs, vec4 cDs) {

  vec2 zReDs = zDs.xy;
  vec2 zImDs = zDs.zw;

  vec2 cReDs = cDs.xy;
  vec2 cImDs = cDs.zw;

  vec2 twoDs = ds_set(2.0);
  vec2 fourDs = ds_set(4.0);

  int iteration = 0;

  while (iteration < maxIterations) {
    vec2 dotProductDs = ds_add(ds_mul(zReDs, zReDs), ds_mul(zImDs, zImDs));
    if (ds_compare(dotProductDs, fourDs) > 0) break;

    vec2 zSquaredReDs = ds_sub(ds_mul(zReDs, zReDs), ds_mul(zImDs, zImDs));
    vec2 zSquaredImDs = ds_mul(twoDs, ds_mul(zReDs, zImDs));

    zReDs = ds_add(zSquaredReDs, cReDs);
    zImDs = ds_add(zSquaredImDs, cImDs);

    iteration++;
  }

  // TODO
  // http://linas.org/art-gallery/escape/escape.html
  // return(float(n) + 1. - log(log(length(vec2(zx.x, zy.x))))/log(2.));

  int s = 255 * iteration / maxIterations;
  int t = 0;
  ivec2 coord = ivec2(s, t);
  int lod = 0;
  return texelFetch(colourMap, coord, lod);
}
