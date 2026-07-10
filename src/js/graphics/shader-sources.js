import loopShaderSource from "@app/shaders/loop.glsl?raw";
import vertexShaderSource from "@app/shaders/shader.vert.glsl?raw";
import mandelbrotShaderSource from "@app/shaders/mandelbrot.frag.glsl?raw";
import juliaShaderSource from "@app/shaders/julia.frag.glsl?raw";

export const shaderSources = {
  loop: loopShaderSource,
  vertex: vertexShaderSource,
  mandelbrot: mandelbrotShaderSource,
  julia: juliaShaderSource,
};
