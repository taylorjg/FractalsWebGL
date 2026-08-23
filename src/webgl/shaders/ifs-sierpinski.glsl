const float IFS_REF_PIXEL_SIZE = 1.0 / 1080.0;
const float IFS_DUAL_BRANCH = 0.0;
const float IFS_LOG_BASE = 8.0;
const float IFS_GAMMA = 0.9;
const vec3 IFS_BACKGROUND = vec3(0.08, 0.10, 0.18);
const vec3 IFS_FOREGROUND = vec3(0.95, 0.55, 0.15);
const vec3 IFS_BRANCH0 = IFS_FOREGROUND;
const vec3 IFS_BRANCH1 = IFS_FOREGROUND;

vec2 applyTransform(vec2 p, int transformIndex) {
  if (transformIndex == 0) {
    return vec2(0.5 * p.x, 0.5 * p.y);
  }
  if (transformIndex == 1) {
    return vec2(0.5 * p.x + 0.5, 0.5 * p.y);
  }
  return vec2(0.5 * p.x + 0.25, 0.5 * p.y + 0.4330127);
}

int chooseTransform(float r) {
  if (r < 0.3333333) {
    return 0;
  }
  if (r < 0.6666667) {
    return 1;
  }
  return 2;
}
