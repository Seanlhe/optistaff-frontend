import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents() {
      // No-op
    },
    // Slow down test execution for smooth visual flow
    defaultCommandTimeout: 10000, // 10 seconds timeout for commands
    pageLoadTimeout: 30000, // 30 seconds for page loads
    requestTimeout: 10000, // 10 seconds for network requests
    responseTimeout: 10000, // 10 seconds for responses
    commandDelay: 800, // 800ms delay between commands for smooth execution
    scrollBehavior: 'center', // Scroll elements to center of viewport
  },
});