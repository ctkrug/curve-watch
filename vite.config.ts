import { defineConfig } from "vite";

// Relative base so the built site works when served from a subpath
// (e.g. apps.charliekrug.com/curve-watch), not just from the domain root.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
});
