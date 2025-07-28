import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'], // Backend tests need Supabase setup
    include: [
      'tests/unit/create-default-preferences.test.ts',
      'tests/unit/upsert-user-preferences.test.ts', 
      'tests/unit/validate-job-names.test.ts',
      'tests/unit/get-user-location.test.ts'
    ],
    testTimeout: 10000, // Longer timeout for database operations
    hookTimeout: 10000,
    // Allow concurrent execution for these specific DB function tests
    // since they're isolated unit tests
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4, // One thread per test file
        minThreads: 1,
      }
    },
    maxConcurrency: 4, // Allow up to 4 tests to run concurrently
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