/**
 * Integration test setup and runner
 */
import type { MochaOptions } from 'mocha';
const path = require('path') as typeof import('path');
const Mocha = require('mocha');
const { glob } = require('glob');

/**
 * Options for running tests
 */
interface RunOptions {
  specificTests?: string[];
  reporter?: string;
  mocha?: MochaOptions;
}

/**
 * Run integration tests
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
    timeout: 20000, // Longer timeout for integration tests
    fullTrace: true,
    ...options.mocha
  });

  // Use the compiled tests directory
  const testsRoot = path.resolve(__dirname);

  return new Promise<void>((resolve, reject) => {
    // Find all test files
    (glob('**/*.test.js', { cwd: testsRoot }) as Promise<string[]>)
      .then((files) => {        
        // Only show detailed logs in verbose mode
        if (isVerbose) {
          console.log('\n======= RUNNING INTEGRATION TEST FILES =======');
          files.forEach((f: string) => console.log(`- ${f}`));
        } else {
          // In non-verbose mode, just show a simple message
          console.log(`Running ${files.length} integration test files...`);
        }
        console.log('==================================\n');
        
        // Add files to the test suite
        files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // Run the mocha test
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
      })
      .catch((err: Error) => {
        reject(err);
      });
  });
}

module.exports = { run };