import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"], // Backend tests need Supabase setup
    include: [
      "tests/unit/**/*.test.{ts,tsx}",
      "tests/integration/**/*.test.{ts,tsx}",
      "tests/backendunit/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
      "tests/frontendSuccessUnit/**/*",
      "tests/frontendFailUnit/**/*",
    ],
    testTimeout: 10000, // Longer timeout for database operations
    hookTimeout: 10000,
    // Force sequential execution for database tests to avoid race conditions
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true, // Run all tests in single process
      },
    },
    maxConcurrency: 1, // Run one test file at a time
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
