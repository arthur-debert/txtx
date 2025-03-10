const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  // Test file pattern
  files: 'src/test/**/*.test.js',
  workspaceFolder: './fixtures',
  // Suppress warnings by disabling other extensions and reducing verbosity
  launchArgs: ['--disable-extensions', '--log=trace'],
  verbose: false,
  printLogs: false,
  printStdout: false,
  printStderr: false,
  mocha: {
    ui: 'tdd',
    timeout: 20000,
    reporter: "min" // Try list reporter for more detailed output
  }
});