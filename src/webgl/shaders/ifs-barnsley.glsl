const float IFS_REF_PIXEL_SIZE = 10.0 / 1080.0;
const float IFS_DUAL_BRANCH = 0.0;
const float IFS_LOG_BASE = 8.0;
const float IFS_GAMMA = 0.9;
const vec3 IFS_BACKGROUND = vec3(0.11, 0.16, 0.14);
const vec3 IFS_FOREGROUND = vec3(0.35, 0.78, 0.38);
const vec3 IFS_BRANCH0 = IFS_FOREGROUND;
const vec3 IFS_BRANCH1 = IFS_FOREGROUND;

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
