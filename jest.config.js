// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/Test/config/test-setup.js'],
  coverageDirectory: './coverage',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/config/',
    '/routes/',
    '/uploads/'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/config/'
  ]
};