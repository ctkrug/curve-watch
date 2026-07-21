import { defineConfig } from "vite";

// Relative base so the built site works when served from a subpath
// (e.g. apps.charliekrug.com/curve-watch), not just from the domain root.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
  test: {
    coverage: {
      include: ["src/lib/**/*.ts"],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
});
