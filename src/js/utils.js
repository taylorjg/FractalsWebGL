export const clamp = (min, max, value) => Math.max(min, Math.min(max, value));

export const randomFloat = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const randomInt = (min, max) => {
  return Math.trunc(randomFloat(min, max));
};

export const randomElement = (elements) => {
  const randomIndex = randomInt(0, elements.length);
  return elements[randomIndex];
};

export const randomPanSpeed = () => randomFloat(-0.1, 0.1);

export const randomZoomSpeed = () => randomFloat(0.01, 1.0);
