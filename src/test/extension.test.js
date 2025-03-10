const assert = require('assert');
const vscode = require('vscode');
const path = require('path');

// Import individual test files
require('./1-basic-extension.test');
require('./2-document-structure.test');
require('./3-syntax-highlighting.test');
require('./4-feature-tests.test');
require('./5-command-tests.test');

// This file now serves as an entry point for all tests
// The actual test implementations have been moved to separate files
// organized by phase as defined in the RFC document