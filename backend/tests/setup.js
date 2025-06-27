const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(() => {
  // Setup test database or mock services
  console.log('Setting up test environment...');
});

afterAll(() => {
  // Cleanup after all tests
  console.log('Cleaning up test environment...');
});

// Increase timeout for async operations
jest.setTimeout(30000);
