import "@app/styles.css";
import { startGraphics } from "@app/webgl/start-graphics";

document.title = `Fractals WebGL (version: ${__APP_VERSION__})`;

const isBoolTrue = (s) => {
  const trueValues = ["", "true", "1", "on"];
  return trueValues.includes(s?.toLowerCase());
};

const url = new URL(document.location);
const manualMode = url.searchParams.get("mode") === "manual";
const preview = isBoolTrue(url.searchParams.get("preview"));

startGraphics({ manualMode, preview });
