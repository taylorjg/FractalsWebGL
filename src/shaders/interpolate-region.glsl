uniform vec2 uResolution;
uniform vec2 uRegionBottomLeft;
uniform vec2 uRegionTopRight;

vec2 interpolateRegion() {
  vec2 dimensions = uRegionTopRight - uRegionBottomLeft;
  vec2 offset = dimensions * gl_FragCoord.xy / uResolution;
  offset.y = dimensions.y - offset.y;
  return uRegionBottomLeft + offset;
}
