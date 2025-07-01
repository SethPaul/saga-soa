// Common Jest configuration for the workspace
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html', 'json'],
  testMatch: ['**/*.(test|spec).{ts,js}'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/main.ts',
  ],
};