uniform vec4 uRegionBottomLeftDs;
uniform vec4 uRegionTopRightDs;

vec4 interpolateRegionDs() {
  vec2 leftDs = uRegionBottomLeftDs.xy;
  vec2 bottomDs = uRegionBottomLeftDs.zw;

  vec2 rightDs = uRegionTopRightDs.xy;
  vec2 topDs = uRegionTopRightDs.zw;

  vec2 widthDs = ds_sub(rightDs, leftDs);
  vec2 heightDs = ds_sub(topDs, bottomDs);

  vec2 fragCoordXDs = ds_set(gl_FragCoord.x);
  vec2 fragCoordYDs = ds_set(gl_FragCoord.y);

  vec2 offsetXDs = ds_mul(
    ds_mul(widthDs, fragCoordXDs),
    ds_set(1.0 / uResolution.x)
  );

  vec2 offsetYDs = ds_mul(
    ds_mul(heightDs, fragCoordYDs),
    ds_set(1.0 / uResolution.y)
  );

  offsetYDs = ds_sub(heightDs, offsetYDs);

  return vec4(
    ds_add(leftDs, offsetXDs),
    ds_add(bottomDs, offsetYDs)
  );
}
