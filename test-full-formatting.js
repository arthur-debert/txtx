const fs = require('fs');
const path = require('path');

// Read the input file
const inputPath = path.join(
  'tests',
  'integration',
  'fixtures',
  'transform-examples',
  'format-document',
  'full-formatting.rfc'
);
const input = fs.readFileSync(inputPath, 'utf8');

// Import the formatCommands module
const { formatCommands } = require('./dist/src/core/backends/headless/format-commands');

// Run the fullFormatting function
const output = formatCommands.fullFormatting(input);

// Print the output
console.log(output);

// Write the output to a file for comparison
fs.writeFileSync('full-formatting-output.txt', output);