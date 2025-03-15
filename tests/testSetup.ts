/**
 * Common test setup for both unit and integration tests
 */
// Make this a module
export {};

import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';

/**
 * Create a temporary directory
 * @param dirName - Optional name for the directory within the system temp directory
 * @returns The path to the created directory
 */
function createTempDirectory(dirName?: string): string {
  // Generate a unique directory path
  const uniqueId = (crypto as any).randomBytes(8).toString('hex');
  const dirPath = path.join(
    os.tmpdir(),
    'txxt-tests-' + uniqueId,
    dirName ? `${dirName}-${uniqueId}` : uniqueId
  );

  // Ensure the directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

/**
 * Create a temporary file
 * @param filePath - The path to the file
 * @param content - The content to write to the file
 * @returns The path to the created file
 */
function createTempFile(filePath: string, content: string): string {
  fs.writeFileSync(filePath, content);
  return filePath;
}

/**
 * Delete a file if it exists
 * @param filePath - The path to the file
 */
function deleteFileIfExists(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Delete a directory if it exists
 * @param dirPath - The path to the directory
 */
function deleteDirIfExists(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmdirSync(dirPath, { recursive: true });
  }
}

/**
 * Interface for test environment
 */
interface TestEnvironment {
  createFile: (fileName: string, content: string) => string;
  cleanup: () => void;
  getTempDir: () => string;
}

/**
 * Create a test environment
 * @param testDirName - Optional name for the test directory
 * @returns The test environment
 */
function createTestEnvironment(testDirName?: string): TestEnvironment {
  const tempDir = createTempDirectory(testDirName);
  const createdFiles: string[] = [];

  return {
    /**
     * Create a temporary file for testing
     * @param fileName - The name of the file
     * @param content - The content of the file
     * @returns The path to the file
     */
    createFile: (fileName: string, content: string): string => {
      const filePath = path.join(tempDir, fileName);
      createTempFile(filePath, content);
      createdFiles.push(filePath);
      return filePath;
    },

    /**
     * Clean up all created files
     */
    cleanup: (): void => {
      for (const file of createdFiles) {
        deleteFileIfExists(file);
      }
      // Also remove the temporary directory
      deleteDirIfExists(tempDir);
    },

    /**
     * Get the path to the temporary directory
     * @returns The path to the temporary directory
     */
    getTempDir: (): string => tempDir,
  };
}

export default {
  createTempDirectory,
  createTempFile,
  deleteFileIfExists,
  deleteDirIfExists,
  createTestEnvironment,
};
