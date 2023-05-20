export const clamp = (min, max, value) => Math.max(min, Math.min(max, value));

export const randomFloat = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const randomInt = (min, max) => {
  return Math.floor(randomFloat(min, max));
};

export const randomElement = (elements) => {
  const randomIndex = randomInt(0, elements.length);
  return elements[randomIndex];
};

export const randomPanSpeed = () => randomFloat(-0.1, 0.1);

export const randomZoomSpeed = () => randomFloat(0.01, 1.0);

export const drawThumbnail = (pixels, canvas, width, height) => {
  canvas.width = width;
  canvas.height = height;
  const canvasCtx2d = canvas.getContext("2d");

  const pixelsClampedArray = new Uint8ClampedArray(pixels);
  const imageData = new ImageData(pixelsClampedArray, width, height);
  canvasCtx2d.putImageData(imageData, 0, 0);

  // Seems we need to flip the image vertically.
  // https://stackoverflow.com/a/41970080
  canvasCtx2d.scale(1, -1);
  canvasCtx2d.translate(0, -height);
  canvasCtx2d.drawImage(canvas, 0, 0);
};
