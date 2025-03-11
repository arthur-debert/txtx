/**
 * Integration test setup and runner
 */
const path = require('path');
const Mocha = require('mocha');
const { glob } = require('glob');

/**
 * Run integration tests
 * @param {Object} options - Test options
 * @returns {Promise<void>}
 */
function run(options = {}) {
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

  const testsRoot = path.resolve(__dirname, '.');

  return new Promise((resolve, reject) => {
    // Find all test files
    glob('**/*.test.js', { cwd: testsRoot })
      .then(files => {        
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

        try {
          // Run the mocha test
          const runner = mocha.run(failures => {
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
      .catch(err => {
        reject(err);
      });
  });
}

module.exports = { run };