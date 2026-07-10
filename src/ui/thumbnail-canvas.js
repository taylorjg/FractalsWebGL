export const drawThumbnail = (pixels, canvas, width, height) => {
  canvas.width = width;
  canvas.height = height;
  const canvasCtx2d = canvas.getContext("2d");
  canvasCtx2d.setTransform(1, 0, 0, 1, 0, 0);

  const pixelsClampedArray = new Uint8ClampedArray(pixels);
  const imageData = new ImageData(pixelsClampedArray, width, height);
  canvasCtx2d.putImageData(imageData, 0, 0);

  // Seems we need to flip the image vertically.
  // https://stackoverflow.com/a/41970080
  canvasCtx2d.setTransform(1, 0, 0, 1, 0, 0);
  canvasCtx2d.scale(1, -1);
  canvasCtx2d.translate(0, -height);
  canvasCtx2d.drawImage(canvas, 0, 0);
};
