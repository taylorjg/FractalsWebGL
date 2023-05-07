import { startGraphics } from "./graphics";

const url = new URL(document.location);
const manualMode = url.searchParams.get("mode") === "manual";
const contextType = url.searchParams.get("contextType");

startGraphics({ manualMode, contextType });
