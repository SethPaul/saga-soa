import "reflect-metadata";

// Global test setup configuration
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.PORT = "3001";
  process.env.APP_NAME = "test-api";
});

afterAll(() => {
  // Cleanup after all tests
});

// Increase timeout for integration tests
jest.setTimeout(30000);
