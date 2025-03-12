/**
 * Unit test setup and runner
 */
import type { MochaOptions } from 'mocha';
const path = require('path') as typeof import('path');
const Mocha = require('mocha');
const { glob } = require('glob');

// Explicitly load test helpers
require('./testHelpers');

/**
 * Options for running tests
 */
interface RunOptions {
  specificTests?: string[];
  reporter?: string;
  mocha?: MochaOptions;
}

/**
 * Run unit tests
 * @param options - Test options
 * @returns Promise that resolves when tests complete
 */
function run(options: RunOptions = {}): Promise<void> {
  // Determine if we're in verbose mode
  const isVerbose = process.env.VERBOSE === 'true';
  
  // Get reporter from environment or options
  const reporter = process.env.MOCHA_REPORTER || options.reporter || (isVerbose ? 'list' : 'min');
  
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    reporter: reporter,
    timeout: 10000,
    fullTrace: true,
    ...options.mocha
  });

  // Use the compiled tests directory
  const testsRoot = path.resolve(__dirname);

  return new Promise<void>((resolve, reject) => {
    // Find all test files or use specific tests if provided
    const findTests = options.specificTests && options.specificTests.length > 0
      ? Promise.resolve(options.specificTests)
      : (glob('**/*.test.js', { cwd: testsRoot }) as Promise<string[]>);
    
    findTests
      .then(files => {        
        // Only show detailed logs in verbose mode
        if (isVerbose) {
          console.log('\n======= RUNNING UNIT TEST FILES =======');
          files.forEach(f => console.log(`- ${f}`));
        } else {
          // In non-verbose mode, just show a simple message
          console.log(`Running ${files.length} unit test files...`);
        }
        console.log('==================================\n');
        
        // Add files to the test suite
        files.forEach(f => {
          // If it's a specific test with a relative path, resolve it
          const filePath = f.startsWith('./') || f.startsWith('../') || path.isAbsolute(f)
            ? f
            : path.resolve(testsRoot, f);
          
          mocha.addFile(filePath);
        });

        try {
          // Run the mocha test
          const runner = mocha.run((failures: number) => {
            isVerbose && console.log(`\n======= UNIT TEST RESULTS: ${failures} failures =======\n`);
            if (failures > 0) {
              reject(new Error(`${failures} unit tests failed.`));
            } else {
              resolve();
            }
          });
        } catch (err) {
          console.error(err);
          reject(err);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

module.exports = { run };