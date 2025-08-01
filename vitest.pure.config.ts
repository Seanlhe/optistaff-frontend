import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    // No setupFiles - pure functions don't need Supabase
    include: [
      "tests/unit/**/*-pure.test.{ts,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
    ],
    testTimeout: 5000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env": process.env,
  },
});