#!/usr/bin/env node

const path = require('path');
const { runTests } = require('@vscode/test-electron');

/**
 * Main test runner script
 * Runs unit tests, integration tests, or both based on command-line arguments
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const testType = args[0]; // 'unit', 'integration', or undefined for both
    
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../');
    
    // Default to running both test types if none specified
    if (!testType || (testType !== 'unit' && testType !== 'integration')) {
      console.log('Running both unit and integration tests...');
      await runUnitTests();
      await runIntegrationTests();
      return;
    }
    
    // Run the specified test type
    if (testType === 'unit') {
      console.log('Running unit tests...');
      await runUnitTests();
    } else if (testType === 'integration') {
      console.log('Running integration tests...');
      await runIntegrationTests();
    }
  } catch (err) {
    console.error('Failed to run tests:', err);
    process.exit(1);
  }
}

/**
 * Run unit tests
 */
async function runUnitTests() {
  try {
    // For unit tests, we don't need to launch VS Code
    // We can run them directly with Mocha
    const unitTestsPath = path.resolve(__dirname, './unit/index');
    
    // Import and run the unit tests
    const unitTests = require(unitTestsPath);
    await unitTests.run();
    
    console.log('Unit tests completed successfully');
  } catch (err) {
    console.error('Unit tests failed:', err);
    throw err;
  }
}

/**
 * Run integration tests
 */
async function runIntegrationTests() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../');
    const extensionTestsPath = path.resolve(__dirname, './integration/index');
    
    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        '--disable-extensions',
        path.resolve(extensionDevelopmentPath, 'fixtures')
      ]
    });
    
    console.log('Integration tests completed successfully');
  } catch (err) {
    console.error('Integration tests failed:', err);
    throw err;
  }
}

// Run the main function
main();