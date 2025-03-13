const fs = require('fs');
const path = require('path');

// Read the input file
const inputPath = path.join(
  'tests',
  'integration',
  'fixtures',
  'transform-examples',
  'format-document',
  'metadata-formatting.rfc'
);
const input = fs.readFileSync(inputPath, 'utf8');

// Import the formatCommands module
const { formatCommands } = require('./dist/src/core/backends/headless/format-commands');

// Run the formatDocument function
const output = formatCommands.formatDocument(input);

// Print the output
console.log(output);

// Write the output to a file for comparison
fs.writeFileSync('metadata-formatting-output.txt', output);