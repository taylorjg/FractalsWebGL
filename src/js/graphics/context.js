const CONTEXT_TYPE_EXPERIMENTAL_WEBGL = "experimental-webgl";
const CONTEXT_TYPE_WEBGL = "webgl";
const CONTEXT_TYPE_WEBGL_2 = "webgl2";

const VALID_CONTEXT_TYPES = [
  CONTEXT_TYPE_EXPERIMENTAL_WEBGL,
  CONTEXT_TYPE_WEBGL,
  CONTEXT_TYPE_WEBGL_2,
];

export const initialiseWebGL = (ctx, canvas) => {
  const tryContextType = (contextType) => {
    try {
      ctx.gl = canvas.getContext(contextType);
      if (!ctx.gl) {
        console.log(`Failed to initialise WebGL (contextType: ${contextType})`);
      }
    } catch (error) {
      alert(`Exception trying to initialise WebGL (contextType: ${contextType})\n${error.message}`);
    }

    const result = Boolean(ctx.gl);

    if (result && contextType === CONTEXT_TYPE_WEBGL_2) {
      ctx.isWebGL2 = true;
    }

    return result;
  };

  const contextTypeToTryFirst = VALID_CONTEXT_TYPES.includes(ctx.queryParamOptions.contextType)
    ? ctx.queryParamOptions.contextType
    : CONTEXT_TYPE_WEBGL_2;

  if (!tryContextType(contextTypeToTryFirst)) {
    if (contextTypeToTryFirst !== CONTEXT_TYPE_WEBGL) {
      tryContextType(CONTEXT_TYPE_WEBGL);
    }
  }
};
