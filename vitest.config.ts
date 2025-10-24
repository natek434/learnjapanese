import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: path.resolve(__dirname, "tests/setup.ts"),
    coverage: {
      reporter: ["text", "lcov"],
      exclude: ["tests/setup.ts"]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      "@/src": path.resolve(__dirname, "src"),
      "@/app": path.resolve(__dirname, "app")
    }
  }
});
