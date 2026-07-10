import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  base: "/FractalsWebGL/",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    environment: "node",
  },
});
