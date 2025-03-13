#!/usr/bin/env node

// Make this a module
export {};

const path = require('path') as typeof import('path');
const { runTests } = require('@vscode/test-electron');
const fs = require('fs');

/**
 * Copy directory recursively
 */
function copyDir(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Main test runner script
 * Runs unit tests, integration tests, or both based on command-line arguments
 */
async function main() {
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

    // Copy package.json to dist directory to help with extension loading
    const packageJsonPath = path.join(extensionDevelopmentPath, 'package.json');
    const distPackageJsonPath = path.join(distDir, 'package.json');
    if (fs.existsSync(packageJsonPath) && fs.existsSync(distDir)) {
      fs.copyFileSync(packageJsonPath, distPackageJsonPath);
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
async function runUnitTests(specificTests: string[] = []) {
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
async function runIntegrationTests() {
  try {
    // The folder containing the Extension Manifest package.json (root of the project)
    const extensionDevelopmentPath = path.resolve(__dirname, '../');
    
    // The path to the extension tests script (compiled version)
    const extensionTestsPath = path.resolve(__dirname, './integration/index');
    
    // Set up test workspace
    const testWorkspacePath = path.join(extensionDevelopmentPath, '.vscode-test', 'test-workspace');
    if (!fs.existsSync(testWorkspacePath)) {
      fs.mkdirSync(testWorkspacePath, { recursive: true });
    }
    
    // Copy fixtures to test workspace
    const fixturesPath = path.join(extensionDevelopmentPath, 'fixtures');
    const testFixturesPath = path.join(testWorkspacePath, 'fixtures');
    copyDir(fixturesPath, testFixturesPath);
    
    // Copy integration test fixtures
    const integrationFixturesPath = path.join(extensionDevelopmentPath, 'tests', 'integration', 'fixtures');
    const testIntegrationFixturesPath = path.join(testWorkspacePath, 'tests', 'integration', 'fixtures');
    copyDir(integrationFixturesPath, testIntegrationFixturesPath);
    
    // Create settings.json to ensure .rfc files are associated with our extension
    const settingsPath = path.join(testWorkspacePath, '.vscode');
    if (!fs.existsSync(settingsPath)) {
      fs.mkdirSync(settingsPath, { recursive: true });
    }
    fs.writeFileSync(
      path.join(settingsPath, 'settings.json'),
      JSON.stringify({
        'files.associations': {
          '*.rfc': 'rfcdoc'
        }
      }, null, 2)
    );
    
    // Create a user data directory for VS Code
    const userDataDir = path.join(extensionDevelopmentPath, '.vscode-test', 'user-data');
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    // Define launch arguments
    const launchArgs = [
      testWorkspacePath,
      '--disable-extensions'
    ];

    // Pass launch arguments to the test environment via environment variable
    process.env.VSCODE_LAUNCH_ARGS = JSON.stringify(launchArgs);
    
    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs
    });
    
    console.log('Integration tests completed successfully');
  } catch (err) {
    console.error('Integration tests failed:', err);
    throw err;
  }
}

// Run the main function
main().catch(console.error);