/**
 * Integration test helpers
 */
import path from 'path';
import * as vscode from 'vscode';
import fs from 'fs';
import testSetup from '../testSetup.js';

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

// Get verbose flag from environment
export const isVerbose = process.env.VERBOSE === 'true';

// Import extension modules
import * as vscodeLib from '../../src/extension/vscode.lib.js';
import { 
  setNotificationConfig, 
  enableNotification, 
  disableNotification, 
  enableAllNotifications, 
  disableAllNotifications 
} from '../../src/extension/notifications.js';

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
  // When running from dist, we need to go up one more level to reach the project root
  const isDist = __dirname.includes('dist');
  const projectRoot = isDist 
    ? path.resolve(__dirname, '..', '..', '..') 
    : path.resolve(__dirname, '..', '..');
  return path.join(projectRoot, 'fixtures', fixtureName);
}

/**
 * Get the path to a test fixture
 * @param fixtureName - The name of the fixture file
 * @returns The absolute path to the fixture file
 */
export function getTestFixturePath(fixtureName: string): string {
  // Use the original fixtures directory
  // When running from dist, we need to go up one more level to reach the project root
  const isDist = __dirname.includes('dist');
  const integrationTestsRoot = isDist
    ? path.resolve(__dirname, '..', '..', '..', 'tests', 'integration')
    : path.resolve(__dirname, '..', '..', 'tests', 'integration');
  return path.join(integrationTestsRoot, 'fixtures', fixtureName);
}