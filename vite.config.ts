import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    target: "es2020",
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
});
