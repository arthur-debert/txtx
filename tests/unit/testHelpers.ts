/**
 * Unit test helpers
 * This file is loaded before unit tests via .mocharc.json
 */
import * as path from 'path';
import * as testSetup from '../testSetup';

// Declare global for TypeScript
declare global {
  var testHelpers: {
    isVerbose: boolean;
    createTestFile: (fileName: string, content: string) => string;
    getTestDir: () => string;
  };
}

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
 * @param fileName - The name of the file
 * @param content - The content of the file
 * @returns The path to the created file
 */
function createTestFile(fileName: string, content: string): string {
  return testEnv.createFile(fileName, content);
}

/**
 * Get the path to the temporary test directory
 * @returns The path to the temporary test directory
 */
function getTestDir(): string {
  return testEnv.getTempDir();
}

// Export helper functions
export {
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