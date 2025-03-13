/**
 * Integration test setup and runner
 */
import * as path from 'path';
import Mocha = require('mocha');
import { glob } from 'glob';

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