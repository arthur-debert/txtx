#!/usr/bin/env node

import * as path from 'path';
import { runTests } from '@vscode/test-electron';
import * as fs from 'fs';

/**
 * Main test runner script
 * Runs unit tests, integration tests, or both based on command-line arguments
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const testType = args[0]; // 'unit', 'integration', or undefined for both
    const specificTests = args.slice(1); // Any additional arguments are specific test files
    
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../');
    
    // Check if dist directory exists, if not, warn that compilation might be needed
    const distDir = path.join(extensionDevelopmentPath, 'dist');
    if (!fs.existsSync(distDir)) {
      console.warn('Warning: dist directory not found. You may need to run "npm run compile" first.');
    }
    
    // Default to running both test types if none specified
    if (!testType || (testType !== 'unit' && testType !== 'integration')) {
      console.log('Running both unit and integration tests...');
      await runUnitTests(specificTests);
      await runIntegrationTests();
      return;
    }
    
    // Run the specified test type
    if (testType === 'unit') {
      console.log('Running unit tests...');
      await runUnitTests(specificTests);
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
 * @param specificTests - Optional array of specific test files to run
 */
async function runUnitTests(specificTests: string[] = []): Promise<void> {
  try {
    // For unit tests, we don't need to launch VS Code
    // We can run them directly with Mocha
    const unitTestsPath = path.resolve(__dirname, './unit/index');
    
    // Import and run the unit tests
    // Using require here because we need dynamic imports
    const unitTests = require(unitTestsPath);
    await unitTests.run({ specificTests });
    
    console.log('Unit tests completed successfully');
  } catch (err) {
    console.error('Unit tests failed:', err);
    throw err;
  }
}

/**
 * Run integration tests
 */
async function runIntegrationTests(): Promise<void> {
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