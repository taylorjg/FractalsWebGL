import loopShaderSource from "./shaders/loop.glsl?raw";
import vertexShaderSource from "./shaders/shader.vert.glsl?raw";
import mandelbrotShaderSource from "./shaders/mandelbrot.frag.glsl?raw";
import juliaShaderSource from "./shaders/julia.frag.glsl?raw";

export const shaderSources = {
  loop: loopShaderSource,
  vertex: vertexShaderSource,
  mandelbrot: mandelbrotShaderSource,
  julia: juliaShaderSource,
};
