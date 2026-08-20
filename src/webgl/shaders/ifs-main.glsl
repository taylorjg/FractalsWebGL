uniform int uMaxIterations;
uniform int uReturnIteration;
uniform sampler2D uColourMap;
uniform vec2 uRegionCentre;

in vec2 vRegionPosition;
out vec4 fragColor;

void main(void) {
  const int BURN_IN = 20;

  vec2 cellPos = vec2(
    vRegionPosition.x,
    2.0 * uRegionCentre.y - vRegionPosition.y
  );

  float pixelSize = max(length(dFdx(vRegionPosition)), length(dFdy(vRegionPosition)));
  float sigma = pixelSize * 2.0;
  float invSigmaSq = 1.0 / (sigma * sigma);

  rngState = uint(gl_FragCoord.x) * 1973u + uint(gl_FragCoord.y) * 9277u + 9703u;

  vec2 p = vec2(0.0);
  float accum = 0.0;
  int step = 0;

  while (step < uMaxIterations) {
    int transformIndex = chooseTransform(random());
    p = applyTransform(p, transformIndex);

    if (step >= BURN_IN) {
      vec2 delta = p - cellPos;
      float w = exp(-dot(delta, delta) * invSigmaSq);
      accum += w * w;
    }

    step++;
  }

  if (uReturnIteration > 0) {
    fragColor = encodeAccumulation(accum);
    return;
  }

  float pixelArea = max(pixelSize * pixelSize, 1e-12);
  float zoomCompensation = (IFS_REF_PIXEL_SIZE * IFS_REF_PIXEL_SIZE) / pixelArea;
  float adjustedAccum = accum * zoomCompensation;

  float s = clamp(log(1.0 + adjustedAccum) / log(1.0 + 8.0), 0.0, 1.0);
  s = pow(s, 0.9);
  fragColor = vec4(mix(IFS_BACKGROUND, IFS_FOREGROUND, s), 1.0);
}
