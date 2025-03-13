/**
 * Integration test setup and runner
 */
import * as path from 'path';
import Mocha = require('mocha');
import { glob } from 'glob';
import * as vscode from 'vscode';
import * as fs from 'fs';

interface TestOptions {
  reporter?: string;
  mocha?: Partial<Mocha.MochaOptions>;
}

/**
 * Run integration tests
 * @param options - Test options
 * @returns Promise that resolves when tests complete
 */
export async function run(options: TestOptions = {}): Promise<void> {
  // Determine if we're in verbose mode
  const isVerbose = process.env.VERBOSE === 'true';
  
  // Get reporter from environment or options
  const reporter = process.env.MOCHA_REPORTER || options.reporter || (isVerbose ? 'list' : 'min');
  
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    reporter: reporter,
    timeout: 20000, // Longer timeout for integration tests
    fullTrace: true,
    ...options.mocha
  });

  // Use the dist directory for running compiled tests
  const testsRoot = path.resolve(__dirname);

  try {
    // Check if the extension is loaded before running any tests
    const extension = vscode.extensions.getExtension('rfcdoc.rfcdoc-format');
    if (!extension) {
      // Get debugging information
      const cwd = process.cwd();
      const extensionDevelopmentPath = path.resolve(__dirname, '../../');
      const extensionsDir = path.join(extensionDevelopmentPath, '.vscode-test', 'extensions');
      const expectedExtensionDir = path.join(extensionsDir, 'rfcdoc.rfcdoc-format');
      
      // Get list of all installed extensions
      const installedExtensions = vscode.extensions.all.map(ext => ext.id);
      
      // Get launch arguments from environment variable
      let launchArgs = 'Not available';
      try {
        if (process.env.VSCODE_LAUNCH_ARGS) {
          launchArgs = process.env.VSCODE_LAUNCH_ARGS;
        }
      } catch (err) {
        launchArgs = `Error parsing launch args: ${err}`;
      }
      
      // Check if the expected extension directory exists and what's in it
      let extensionDirContents = 'Directory does not exist';
      if (fs.existsSync(expectedExtensionDir)) {
        try {
          extensionDirContents = fs.readdirSync(expectedExtensionDir).join(', ');
        } catch (err) {
          extensionDirContents = `Error reading directory: ${err}`;
        }
      }
      
      console.error('\n======= ERROR: EXTENSION NOT LOADED =======');
      console.error('The rfcdoc.rfcdoc-format extension is not loaded.');
      console.error('Make sure the extension is properly compiled and loaded in the test environment.');
      console.error('Skipping all tests as they would fail without the extension.');
      console.error('\n--- Debugging Information ---');
      console.error(`Current working directory: ${cwd}`);
      console.error(`Extension development path: ${extensionDevelopmentPath}`);
      console.error(`Expected extension location: ${expectedExtensionDir}`);
      console.error(`Extension directory contents: ${extensionDirContents}`);
      console.error(`Installed extensions: ${installedExtensions.length ? installedExtensions.join(', ') : 'None'}`);
      console.error(`Launch arguments: ${launchArgs}`);
      console.error(`VS Code version: ${vscode.version}`);
      console.error('=======================================\n');
      throw new Error('Extension not loaded - tests skipped');
    }
    
    // Find all test files (compiled .js files)
    const files = await glob('**/*.test.js', { cwd: testsRoot });
    
    // Only show detailed logs in verbose mode
    if (isVerbose) {
      console.log('\n======= RUNNING INTEGRATION TEST FILES =======');
      files.forEach(f => console.log(`- ${f}`));
    } else {
      // In non-verbose mode, just show a simple message
      console.log(`Running ${files.length} integration test files...`);
    }
    console.log('==================================\n');
    
    // Add files to the test suite
    files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

    // Run the mocha test
    return new Promise<void>((resolve, reject) => {
      try {
        const runner = mocha.run((failures: number) => {
          isVerbose && console.log(`\n======= INTEGRATION TEST RESULTS: ${failures} failures =======\n`);
          if (failures > 0) {
            reject(new Error(`${failures} integration tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}