const vscodeLib = require('../extension/vscode.lib');
const { setNotificationConfig, enableNotification, disableNotification, enableAllNotifications, disableAllNotifications, getNotificationConfig } = require('../extension/notifications');
const fileOps = require('./file-operations');

// Get verbose flag from environment
const isVerbose = process.env.VERBOSE === 'true';

// Re-export functions from vscode.lib
const {
  openDocument,
  getDocumentSections
} = vscodeLib;

// Create a test environment helper
function createTestEnv(testDir) {
  return fileOps.createTestEnvironment(testDir);
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

module.exports = {
  isVerbose,
  openDocument,
  getDocumentSections,
  createTestEnv,
  configureNotifications,
  enableTestNotification,
  disableTestNotification,
  resetNotificationConfig
};