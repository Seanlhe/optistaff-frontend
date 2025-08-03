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
      "tests/backendunit/*-validation*.test.{ts,tsx}", // Include validation tests
      "tests/backendunit/uc1/**/*.test.{ts,tsx}", // Include UC1 tests
      "tests/backendunit/uc2/**/*.test.{ts,tsx}", // Include UC2 tests
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