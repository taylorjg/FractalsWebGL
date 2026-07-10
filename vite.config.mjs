import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json" with { type: "json" };

const appSrc = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  base: "/FractalsWebGL/",
  plugins: [react()],
  resolve: {
    alias: {
      "@app": appSrc,
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    environment: "node",
    alias: {
      "@app": appSrc,
    },
  },
});
