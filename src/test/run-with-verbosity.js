#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fileOps = require('./file-operations');

// Parse command line arguments
const args = process.argv.slice(2);
const isVerbose = args.includes('-v');

// Remove the -v flag from args if present
const testArgs = args.filter(arg => arg !== '-v');

// Set up environment variables based on verbosity
const env = { ...process.env };
env.VERBOSE = isVerbose ? 'true' : 'false';

// When not in verbose mode, completely suppress VSCode logs
if (!isVerbose) {
  // Add environment variables to suppress VSCode logs
  env.VSCODE_LOG_LEVEL = 'off';
  env.VSCODE_SUPPRESS_LOGS = 'true';
}

// Create a copy of the .vscode-test.js file with appropriate reporter
const configPath = path.resolve(__dirname, './vscode-test.js');
const fs = require('fs');
const originalConfig = fs.readFileSync(configPath, 'utf8');

// Create a temporary directory and config file
const tempDir = fileOps.createTempDirectory('vscode-test');
const tempConfigPath = path.join(tempDir, 'vscode-test.temp.js');

// Modify the config based on verbosity
let modifiedConfig;
if (isVerbose) {
  // Verbose mode - use list reporter with detailed output
  modifiedConfig = originalConfig
    .replace(/reporter: ['"].*?['"]/g, 'reporter: "list"')
    .replace(/verbose: (true|false)/g, 'verbose: true')
    .replace(/printLogs: (true|false)/g, 'printLogs: true')
    .replace(/printStdout: (true|false)/g, 'printStdout: true')
    .replace(/printStderr: (true|false)/g, 'printStderr: true');
} else {
  // Non-verbose mode - use min reporter with minimal output
  modifiedConfig = originalConfig
    .replace(/reporter: ['"].*?['"]/g, 'reporter: "min"')
    .replace(/verbose: (true|false)/g, 'verbose: false')
    .replace(/printLogs: (true|false)/g, 'printLogs: false')
    .replace(/printStdout: (true|false)/g, 'printStdout: false')
    .replace(/printStderr: (true|false)/g, 'printStderr: false');
}

// Write the modified config to a temporary file
fs.writeFileSync(tempConfigPath, modifiedConfig);

// Set the config file to use
env.VSCODE_TEST_CONFIG = tempConfigPath;

// Add the --config option to the arguments
const child = spawn('vscode-test', ['--config', tempConfigPath, ...testArgs], {
  env,
  stdio: isVerbose ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  shell: true
});

child.on('close', (code) => {
  // Clean up the temporary config file
  try {
    fileOps.deleteFileIfExists(tempConfigPath);
    fileOps.deleteDirIfExists(tempDir);
  } catch (err) {
    // Ignore errors during cleanup
  }
  
  // Exit with the same code as the child process
  process.exit(code === null ? 1 : code);
});

// In non-verbose mode, we still want to show test results but not all the VSCode logs
if (!isVerbose) {
  // Only output test results and errors
  child.stdout.on('data', (data) => {
    const output = data.toString();
    // Only show lines that contain test results or errors
    if (output.includes('passing') || output.includes('failing') || output.includes('✓') || output.includes('✖')) {
      process.stdout.write(data);
    }
  });
  
  child.stderr.on('data', data => process.stderr.write(data));
}