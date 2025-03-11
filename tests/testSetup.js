/**
 * Common test setup for both unit and integration tests
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

/**
 * Create a temporary directory
 * @param {string} [dirName] - Optional name for the directory within the system temp directory
 * @returns {string} - The path to the created directory
 */
function createTempDirectory(dirName) {
  // Generate a unique directory path
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const dirPath = path.join(
    os.tmpdir(),
    'rfcdoc-tests-' + uniqueId,
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
 * Delete a directory if it exists
 * @param {string} dirPath - The path to the directory
 */
function deleteDirIfExists(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmdirSync(dirPath, { recursive: true });
  }
}

/**
 * Create a test environment
 * @param {string} [testDirName] - Optional name for the test directory
 * @returns {Object} - The test environment
 */
function createTestEnvironment(testDirName) {
  const tempDir = createTempDirectory(testDirName);
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
      // Also remove the temporary directory
      deleteDirIfExists(tempDir);
    },

    /**
     * Get the path to the temporary directory
     * @returns {string} - The path to the temporary directory
     */
    getTempDir: () => tempDir
  };
}

module.exports = {
  createTempDirectory,
  createTempFile,
  deleteFileIfExists,
  deleteDirIfExists,
  createTestEnvironment
};