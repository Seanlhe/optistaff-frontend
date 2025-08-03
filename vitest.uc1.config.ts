import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup-frontend.ts"], // Use frontend setup for mocking
    include: [
      "tests/backendunit/uc1/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
    ],
    testTimeout: 10000, // Longer timeout for async operations
    hookTimeout: 10000,
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
