#version 300 es
precision highp float;

uniform int uMaxIterations;
uniform int uReturnIteration;
uniform sampler2D uColourMap;
uniform vec2 uRegionCentre;

in vec2 vRegionPosition;
out vec4 fragColor;

uint rngState;

float random() {
  rngState = rngState * 747796405u + 2891336453u;
  uint word = ((rngState >> ((rngState >> 28u) + 4u)) ^ rngState) * 277803737u;
  return float((word >> 22u) ^ word) / 4294967296.0;
}

vec2 applyTransform(vec2 p, int transformIndex) {
  if (transformIndex == 0) {
    return vec2(0.0, 0.16 * p.y);
  }
  if (transformIndex == 1) {
    return vec2(
      0.85 * p.x + 0.04 * p.y,
      -0.04 * p.x + 0.85 * p.y + 1.6
    );
  }
  if (transformIndex == 2) {
    return vec2(
      0.2 * p.x - 0.26 * p.y,
      0.23 * p.x + 0.22 * p.y + 1.6
    );
  }
  return vec2(
    -0.15 * p.x + 0.28 * p.y,
    0.26 * p.x + 0.24 * p.y + 0.44
  );
}

int chooseTransform(float r) {
  if (r < 0.01) {
    return 0;
  }
  if (r < 0.86) {
    return 1;
  }
  if (r < 0.93) {
    return 2;
  }
  return 3;
}

vec4 encodeAccumulation(float accum) {
  int encoded = int(min(accum * 256.0, 65535.0));
  int hi = (encoded & 0xff00) >> 8;
  int lo = encoded & 0xff;
  return vec4(float(lo) / 255.0, float(hi) / 255.0, 0.0, 1.0);
}

void main(void) {
  const int BURN_IN = 20;

  // modelView flips gl_Position but not vRegionPosition, so reflect y within the region.
  vec2 cellPos = vec2(
    vRegionPosition.x,
    2.0 * uRegionCentre.y - vRegionPosition.y
  );

  float pixelSize = max(length(dFdx(vRegionPosition)), length(dFdy(vRegionPosition)));
  // Narrow kernel for sharp fronds; squaring the weight further tightens the falloff.
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

  // Hit count scales ~ pixel area; compensate so brightness holds when zoomed in.
  const float REF_PIXEL_SIZE = 10.0 / 1080.0;
  float pixelArea = max(pixelSize * pixelSize, 1e-12);
  float zoomCompensation = (REF_PIXEL_SIZE * REF_PIXEL_SIZE) / pixelArea;
  float adjustedAccum = accum * zoomCompensation;

  float s = clamp(log(1.0 + adjustedAccum) / log(1.0 + 8.0), 0.0, 1.0);
  s = pow(s, 0.9);

  // Muted blue-green backdrop; brighter spring-green fronds.
  const vec3 background = vec3(0.11, 0.16, 0.14);
  const vec3 fernGreen = vec3(0.35, 0.78, 0.38);
  fragColor = vec4(mix(background, fernGreen, s), 1.0);
}
