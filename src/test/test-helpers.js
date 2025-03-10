const vscodeLib = require('../../vscode.lib');

// Get verbose flag from environment
const isVerbose = process.env.VERBOSE === 'true';

// Re-export functions from vscode.lib
const {
  openDocument,
  getDocumentSections
} = vscodeLib;

// Create a test environment helper
function createTestEnv(testDir) {
  return vscodeLib.createTestEnvironment(testDir);
}

module.exports = {
  isVerbose,
  openDocument,
  getDocumentSections,
  createTestEnv
};