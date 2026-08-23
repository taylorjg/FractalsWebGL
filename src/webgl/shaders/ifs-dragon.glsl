const float IFS_REF_PIXEL_SIZE = 1.2 / 1080.0;
const float IFS_DUAL_BRANCH = 1.0;
const float IFS_LOG_BASE = 5.0;
const float IFS_GAMMA = 0.72;
const vec3 IFS_BACKGROUND = vec3(0.03, 0.04, 0.12);
const vec3 IFS_FOREGROUND = vec3(0.95, 0.95, 1.0);
const vec3 IFS_BRANCH0 = vec3(0.15, 0.92, 1.0);
const vec3 IFS_BRANCH1 = vec3(1.0, 0.28, 0.55);

vec2 applyTransform(vec2 p, int transformIndex) {
  if (transformIndex == 0) {
    return vec2(0.5 * p.x - 0.5 * p.y, 0.5 * p.x + 0.5 * p.y);
  }
  return vec2(0.5 * p.x - 0.5 * p.y + 0.5, 0.5 * p.x + 0.5 * p.y - 0.5);
}

int chooseTransform(float r) {
  return r < 0.5 ? 0 : 1;
}
