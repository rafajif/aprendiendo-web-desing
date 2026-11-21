import { defineConfig } from "vite";

// When deploying to GitHub Pages the site lives at:
// https://<user>.github.io/<repo>/
// Set VITE_BASE env var in CI or default to repo name.
export default defineConfig(({ command }) => ({
  root: ".",
  // Local development is served from `/`; production uses the repository path.
  base: command === "serve"
    ? "/"
    : process.env.VITE_BASE ?? "/aprendiendo-web-desing/",
  publicDir: "public",
  build: {
    outDir: "dist",
    target: "es2020",
    // Inline small assets as base64 to avoid path issues inside srcdoc iframes
    assetsInlineLimit: 0,
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
}));
