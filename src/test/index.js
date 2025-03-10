const path = require('path');
const Mocha = require('mocha');
const { glob } = require('glob');

function run() {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    reporter: 'list',
    timeout: 10000,
    fullTrace: true
  });

  const testsRoot = path.resolve(__dirname, '.');

  return new Promise((resolve, reject) => {
    // Find all test files
    glob('**/*.test.js', { cwd: testsRoot })
      .then(files => {
        console.log('\n======= RUNNING TEST FILES =======');
        files.forEach(f => console.log(`- ${f}`));
        console.log('==================================\n');
        
        // Add files to the test suite
        files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // Run the mocha test
          const runner = mocha.run(failures => {
            console.log(`\n======= TEST RESULTS: ${failures} failures =======\n`);
            if (failures > 0) {
              reject(new Error(`${failures} tests failed.`));
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