/**
 * Unit test helpers
 * This file is loaded before unit tests via .mocharc.json
 */
const path = require('path');
const testSetup = require('../testSetup');

// Get verbose flag from environment
const isVerbose = process.env.VERBOSE === 'true';

// Create a global test environment for all unit tests
const testEnv = testSetup.createTestEnvironment('unit-tests');

// Clean up the test environment after all tests
// Only register the after hook if we're running in Mocha
if (typeof after === 'function') {
  after(() => {
    testEnv.cleanup();
  });
}

/**
 * Create a test file with the given content
 * @param {string} fileName - The name of the file
 * @param {string} content - The content of the file
 * @returns {string} - The path to the created file
 */
function createTestFile(fileName, content) {
  return testEnv.createFile(fileName, content);
}

/**
 * Get the path to the temporary test directory
 * @returns {string} - The path to the temporary test directory
 */
function getTestDir() {
  return testEnv.getTempDir();
}

// Export helper functions
module.exports = {
  isVerbose,
  createTestFile,
  getTestDir
};

// Also make helpers available globally for convenience in tests
global.testHelpers = {
  isVerbose,
  createTestFile,
  getTestDir
};