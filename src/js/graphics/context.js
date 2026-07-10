const WEBGL2_REQUIRED_MESSAGE =
  "WebGL 2 is required to run this app. Try updating your browser or enabling hardware acceleration in your browser settings.";

const showWebGL2RequiredMessage = () => {
  const message = document.createElement("p");
  message.setAttribute("role", "alert");
  message.textContent = WEBGL2_REQUIRED_MESSAGE;
  Object.assign(message.style, {
    position: "fixed",
    inset: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0",
    padding: "2rem",
    textAlign: "center",
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "Roboto, sans-serif",
  });
  document.body.appendChild(message);
};

export const initialiseWebGL = (ctx, canvas) => {
  try {
    ctx.gl = canvas.getContext("webgl2");
    if (!ctx.gl) {
      console.error("Failed to initialise WebGL 2");
    }
  } catch (error) {
    console.error("Failed to initialise WebGL 2:", error);
  }

  if (!ctx.gl) {
    showWebGL2RequiredMessage();
    return false;
  }

  return true;
};
