import { startGraphics } from "./graphics";

const isBoolTrue = (s) => {
  const trueValues = ["", "true", "1", "on"];
  return trueValues.includes(s?.toLowerCase());
};

const url = new URL(document.location);
const manualMode = url.searchParams.get("mode") === "manual";
const contextType = url.searchParams.get("contextType");
const preview = isBoolTrue(url.searchParams.get("preview"));

startGraphics({ manualMode, contextType, preview });
