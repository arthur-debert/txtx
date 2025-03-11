/**
 * File Operations - Test utilities for file and directory operations
 * 
 * This module provides functions for creating temporary files and directories
 * for testing purposes, as well as cleaning up after tests.
 */

const fs = require('fs');
const path = require('path');

/**
 * Create a temporary directory
 * @param {string} dirPath - The path to create
 * @returns {string} - The path to the created directory
 */
function createTempDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

/**
 * Create a temporary file
 * @param {string} filePath - The path to the file
 * @param {string} content - The content to write to the file
 * @returns {string} - The path to the created file
 */
function createTempFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  return filePath;
}

/**
 * Delete a file if it exists
 * @param {string} filePath - The path to the file
 */
function deleteFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Create a test environment
 * @param {string} testDir - The directory to create temporary files in
 * @returns {Object} - The test environment
 */
function createTestEnvironment(testDir) {
  const tempDir = createTempDirectory(testDir);
  const createdFiles = [];
  
  return {
    /**
     * Create a temporary file for testing
     * @param {string} fileName - The name of the file
     * @param {string} content - The content of the file
     * @returns {string} - The path to the file
     */
    createFile: (fileName, content) => {
      const filePath = path.join(tempDir, fileName);
      createTempFile(filePath, content);
      createdFiles.push(filePath);
      return filePath;
    },
    
    /**
     * Clean up all created files
     */
    cleanup: () => {
      for (const file of createdFiles) {
        deleteFileIfExists(file);
      }
    }
  };
}

module.exports = {
  createTempDirectory,
  createTempFile,
  deleteFileIfExists,
  createTestEnvironment
};