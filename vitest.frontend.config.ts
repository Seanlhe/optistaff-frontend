import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup-frontend.ts'], // Frontend tests need mocking setup
    include: ['tests/frontendSuccessUnit/**/*.test.{ts,tsx}', 'tests/frontendFailUnit/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'tests/integration/**/*', 'tests/unit/**/*'],
    testTimeout: 5000, // Shorter timeout for UI tests
    hookTimeout: 5000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': process.env,
  },
})