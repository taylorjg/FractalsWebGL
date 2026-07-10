import loopShaderSourceWebGL1 from "@app/shaders/webgl1/loop.glsl?raw";
import vertexShaderSourceWebGL1 from "@app/shaders/webgl1/shader.vert.glsl?raw";
import mandelbrotShaderSourceWebGL1 from "@app/shaders/webgl1/mandelbrot.frag.glsl?raw";
import juliaShaderSourceWebGL1 from "@app/shaders/webgl1/julia.frag.glsl?raw";

import loopShaderSourceWebGL2 from "@app/shaders/webgl2/loop.glsl?raw";
import vertexShaderSourceWebGL2 from "@app/shaders/webgl2/shader.vert.glsl?raw";
import mandelbrotShaderSourceWebGL2 from "@app/shaders/webgl2/mandelbrot.frag.glsl?raw";
import juliaShaderSourceWebGL2 from "@app/shaders/webgl2/julia.frag.glsl?raw";

export const shaderSources = {
  webgl1: {
    loop: loopShaderSourceWebGL1,
    vertex: vertexShaderSourceWebGL1,
    mandelbrot: mandelbrotShaderSourceWebGL1,
    julia: juliaShaderSourceWebGL1,
  },
  webgl2: {
    loop: loopShaderSourceWebGL2,
    vertex: vertexShaderSourceWebGL2,
    mandelbrot: mandelbrotShaderSourceWebGL2,
    julia: juliaShaderSourceWebGL2,
  },
};
