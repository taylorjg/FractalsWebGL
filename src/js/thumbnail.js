export const configureThumbnail = ({
  gl,
  createBookmark,
  switchToBookmark,
  setCanvasAndViewportSize,
  render,
}) => {
  // https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html
  // https://stackoverflow.com/a/13640310
  const renderThumbnail = (size, configuration) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(
      gl.TEXTURE_2D, // target
      0, // level
      gl.RGBA, // internalFormat
      size, // width
      size, // height
      0, // border
      gl.RGBA, // format
      gl.UNSIGNED_BYTE, // type
      null // pixels
    );

    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, // target
      gl.COLOR_ATTACHMENT0, // attachment
      gl.TEXTURE_2D, // texture target
      texture, // texture
      0 // level
    );

    const savedConfiguration = createBookmark("saved-configuration");
    switchToBookmark(configuration);
    setCanvasAndViewportSize(size, size);

    render();

    const pixels = new Uint8ClampedArray(size * size * 4);
    gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    switchToBookmark(savedConfiguration);
    setCanvasAndViewportSize();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.deleteTexture(texture);

    return pixels;
  };

  return { renderThumbnail };
};
