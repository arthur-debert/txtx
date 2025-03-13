/**
 * Integration test helpers
 */
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';

interface TestEnvironment {
  createFile: (fileName: string, content: string) => string;
  cleanup: () => void;
  getTempDir: () => string;
}

interface TestSetup {
  createTestEnvironment: (testDirName?: string) => TestEnvironment;
  createTempDirectory: (dirName?: string) => string;
  createTempFile: (filePath: string, content: string) => string;
  deleteFileIfExists: (filePath: string) => void;
  deleteDirIfExists: (dirPath: string) => void;
}

// Import testSetup with type assertion
const testSetup = require('../testSetup') as TestSetup;

// Get verbose flag from environment
export const isVerbose = process.env.VERBOSE === 'true';

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
export const {
  openDocument,
  getDocumentSections,
  executeCommand,
  getActiveEditor,
  closeActiveEditor
} = vscodeLib;

// Create a test environment helper
export function createTestEnv(testDirName?: string): TestEnvironment {
  return testSetup.createTestEnvironment(testDirName || 'integration-tests');
}

/**
 * Configure notifications for testing
 * @param config - Configuration object with notification IDs as keys
 */
export function configureNotifications(config: Record<string, boolean>) {
  setNotificationConfig(config);
}

/**
 * Enable a specific notification for testing
 * @param id - The notification ID to enable
 */
export function enableTestNotification(id: string) {
  enableNotification(id);
}

/**
 * Disable a specific notification for testing
 * @param id - The notification ID to disable
 */
export function disableTestNotification(id: string) {
  disableNotification(id);
}

/**
 * Reset notification configuration to default (all disabled)
 */
export function resetNotificationConfig() {
  disableAllNotifications();
}

/**
 * Get the path to a fixture file
 * @param fixtureName - The name of the fixture file
 * @returns The absolute path to the fixture file
 */
export function getFixturePath(fixtureName: string): string {
  // Use the original fixtures directory
  const projectRoot = path.resolve(__dirname, '..', '..');
  return path.join(projectRoot, 'fixtures', fixtureName);
}

/**
 * Get the path to a test fixture
 * @param fixtureName - The name of the fixture file
 * @returns The absolute path to the fixture file
 */
export function getTestFixturePath(fixtureName: string): string {
  // Use the original fixtures directory
  const integrationTestsRoot = path.resolve(__dirname, '..', '..', 'tests', 'integration');
  return path.join(integrationTestsRoot, 'fixtures', fixtureName);
}