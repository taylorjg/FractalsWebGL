import loopShaderSource from "./shaders/loop.glsl?raw";
import vertexShaderSource from "./shaders/shader.vert.glsl?raw";
import mandelbrotShaderSource from "./shaders/mandelbrot.frag.glsl?raw";
import juliaShaderSource from "./shaders/julia.frag.glsl?raw";
import ifsHeaderShaderSource from "./shaders/ifs-header.glsl?raw";
import ifsUtilsShaderSource from "./shaders/ifs-utils.glsl?raw";
import ifsMainShaderSource from "./shaders/ifs-main.glsl?raw";
import ifsBarnsleyShaderSource from "./shaders/ifs-barnsley.glsl?raw";
import ifsSierpinskiShaderSource from "./shaders/ifs-sierpinski.glsl?raw";
import ifsDragonShaderSource from "./shaders/ifs-dragon.glsl?raw";

const composeIfsShader = (specificShaderSource) =>
  [
    ifsHeaderShaderSource,
    specificShaderSource,
    ifsUtilsShaderSource,
    ifsMainShaderSource,
  ].join("\n");

export const shaderSources = {
  loop: loopShaderSource,
  vertex: vertexShaderSource,
  mandelbrot: mandelbrotShaderSource,
  julia: juliaShaderSource,
  barnsley: composeIfsShader(ifsBarnsleyShaderSource),
  sierpinski: composeIfsShader(ifsSierpinskiShaderSource),
  dragon: composeIfsShader(ifsDragonShaderSource),
};
