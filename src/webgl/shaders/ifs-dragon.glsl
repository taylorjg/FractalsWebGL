const float IFS_REF_PIXEL_SIZE = 1.2 / 1080.0;
const vec3 IFS_BACKGROUND = vec3(0.10, 0.10, 0.12);
const vec3 IFS_FOREGROUND = vec3(0.92, 0.90, 0.82);

vec2 applyTransform(vec2 p, int transformIndex) {
  if (transformIndex == 0) {
    return vec2(0.5 * p.x - 0.5 * p.y, 0.5 * p.x + 0.5 * p.y);
  }
  return vec2(0.5 * p.x + 0.5 * p.y + 1.0, -0.5 * p.x + 0.5 * p.y);
}

int chooseTransform(float r) {
  return r < 0.5 ? 0 : 1;
}
