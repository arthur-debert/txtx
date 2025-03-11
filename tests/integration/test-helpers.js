/**
 * Integration test helpers
 */
const path = require('path');
const vscode = require('vscode');
const testSetup = require('../testSetup');

// Get verbose flag from environment
const isVerbose = process.env.VERBOSE === 'true';

// Import extension modules
const vscodeLib = require('../../src/extension/vscode.lib');
const { 
  setNotificationConfig, 
  enableNotification, 
  disableNotification, 
  enableAllNotifications, 
  disableAllNotifications 
} = require('../../src/extension/notifications');

// Re-export functions from vscode.lib
const {
  openDocument,
  getDocumentSections,
  executeCommand,
  getActiveEditor,
  closeActiveEditor
} = vscodeLib;

// Create a test environment helper
function createTestEnv(testDirName) {
  return testSetup.createTestEnvironment(testDirName || 'integration-tests');
}

/**
 * Configure notifications for testing
 * @param {Object} config - Configuration object with notification IDs as keys
 */
function configureNotifications(config) {
  setNotificationConfig(config);
}

/**
 * Enable a specific notification for testing
 * @param {string} id - The notification ID to enable
 */
function enableTestNotification(id) {
  enableNotification(id);
}

/**
 * Disable a specific notification for testing
 * @param {string} id - The notification ID to disable
 */
function disableTestNotification(id) {
  disableNotification(id);
}

/**
 * Reset notification configuration to default (all disabled)
 */
function resetNotificationConfig() {
  disableAllNotifications();
}

/**
 * Get the path to a fixture file
 * @param {string} fixtureName - The name of the fixture file
 * @returns {string} - The absolute path to the fixture file
 */
function getFixturePath(fixtureName) {
  return path.join(path.resolve(__dirname, '..', '..'), 'fixtures', fixtureName);
}

/**
 * Get the path to a test fixture
 * @param {string} fixtureName - The name of the fixture file
 * @returns {string} - The absolute path to the fixture file
 */
function getTestFixturePath(fixtureName) {
  return path.join(__dirname, 'fixtures', fixtureName);
}

module.exports = {
  isVerbose,
  openDocument,
  getDocumentSections,
  executeCommand,
  getActiveEditor,
  closeActiveEditor,
  createTestEnv,
  configureNotifications,
  enableTestNotification,
  disableTestNotification,
  resetNotificationConfig,
  getFixturePath,
  getTestFixturePath
};