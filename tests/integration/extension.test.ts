import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

// Import individual test files
import './1-basic-extension.test';
import './2-document-structure.test';
import './3-syntax-highlighting.test';
import './4-feature-tests.test';
import './5-command-tests.test';

// This file serves as an entry point for all integration tests
// The actual test implementations are in separate files
// organized by phase as defined in the RFC document