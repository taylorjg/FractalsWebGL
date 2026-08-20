uint rngState;

float random() {
  rngState = rngState * 747796405u + 2891336453u;
  uint word = ((rngState >> ((rngState >> 28u) + 4u)) ^ rngState) * 277803737u;
  return float((word >> 22u) ^ word) / 4294967296.0;
}

vec4 encodeAccumulation(float accum) {
  int encoded = int(min(accum * 256.0, 65535.0));
  int hi = (encoded & 0xff00) >> 8;
  int lo = encoded & 0xff;
  return vec4(float(lo) / 255.0, float(hi) / 255.0, 0.0, 1.0);
}
