/**
 * Integration test helpers
 */
import * as path from 'path';
import * as vscode from 'vscode';
import * as testSetup from '../testSetup';

// Get verbose flag from environment
const isVerbose = process.env.VERBOSE === 'true';

// Import extension modules
import * as vscodeLib from '../../src/extension/vscode.lib';
import { 
  setNotificationConfig, 
  enableNotification, 
  disableNotification, 
  enableAllNotifications, 
  disableAllNotifications 
} from '../../src/extension/notifications';

// Re-export functions from vscode.lib
const {
  openDocument,
  getDocumentSections,
  executeCommand,
  getActiveEditor,
  closeActiveEditor
} = vscodeLib;

/**
 * Create a test environment helper
 * @param testDirName - Optional name for the test directory
 * @returns The test environment
 */
function createTestEnv(testDirName?: string) {
  return testSetup.createTestEnvironment(testDirName || 'integration-tests');
}

/**
 * Configure notifications for testing
 * @param config - Configuration object with notification IDs as keys
 */
function configureNotifications(config: Record<string, boolean>): void {
  setNotificationConfig(config);
}

/**
 * Enable a specific notification for testing
 * @param id - The notification ID to enable
 */
function enableTestNotification(id: string): void {
  enableNotification(id);
}

/**
 * Disable a specific notification for testing
 * @param id - The notification ID to disable
 */
function disableTestNotification(id: string): void {
  disableNotification(id);
}

/**
 * Reset notification configuration to default (all disabled)
 */
function resetNotificationConfig(): void {
  disableAllNotifications();
}

/**
 * Get the path to a fixture file
 * @param fixtureName - The name of the fixture file
 * @returns The absolute path to the fixture file
 */
function getFixturePath(fixtureName: string): string {
  return path.join(path.resolve(__dirname, '..', '..'), 'fixtures', fixtureName);
}

/**
 * Get the path to a test fixture
 * @param fixtureName - The name of the fixture file
 * @returns The absolute path to the fixture file
 */
function getTestFixturePath(fixtureName: string): string {
  return path.join(__dirname, 'fixtures', fixtureName);
}

export {
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