const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  // Test file pattern
  files: 'src/test/**/*.test.js',
  workspaceFolder: './fixtures',
  // Suppress warnings by disabling other extensions and reducing verbosity
  launchArgs: ['--disable-extensions', '--log=trace'],
  verbose: true,
  printLogs: true,
  printStdout: true,
  printStderr: true,
  mocha: {
    ui: 'tdd',
    timeout: 20000,
    reporter: 'list' // Try list reporter for more detailed output
  }
});