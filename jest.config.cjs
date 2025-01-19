// jest.config.js

module.exports = {
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
      '/node_modules/(?!(axios)/)', // Transpile axios
    ],
    moduleNameMapper: {
      '\\.(css|less)$': 'identity-obj-proxy', // Mock CSS imports
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  };
  