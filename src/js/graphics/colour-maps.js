import colormap from "colormap";
import * as C from "../constants";

const createColourMapTexture = (gl, colourMap, textureUnit) => {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const pixels = new Uint8Array(colourMap.map((value) => value * 255));
  const width = colourMap.length / 4;
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
};

const loadColourMap = (gl, name, textureUnit) => {
  const colourMap = colormap({
    colormap: name,
    nshades: 256,
    format: "float",
  }).flat();
  createColourMapTexture(gl, colourMap, textureUnit);
  return {
    name,
    colourMap,
    textureUnit,
  };
};

export const loadColourMaps = (ctx) => {
  const { gl, colourMaps } = ctx;
  const maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  const maxColourMaps = maxTextureUnits - 1;
  C.COLOUR_MAP_NAMES.slice(0, maxColourMaps).forEach((colourMapName, index) => {
    // We want to reserve gl.TEXTURE0 for rendering thumbnails
    const textureUnit = index + 1;
    colourMaps.set(index, loadColourMap(gl, colourMapName, textureUnit));
  });
};
