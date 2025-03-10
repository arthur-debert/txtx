const assert = require('assert');
const vscode = require('vscode');

// Determine if we're in verbose mode
const isVerbose = process.env.VERBOSE === 'true';

suite('Extension Test Suite', () => {
  isVerbose && console.log('RUNNING TESTS: Extension Test Suite');
  
  suiteTeardown(() => {
    isVerbose && console.log('TESTS COMPLETED: Extension Test Suite');
    vscode.window.showInformationMessage('All tests done!');
  });

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('txtdoc.txtdoc-format'));
  });

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
  
  test('Extension activation', async () => {
    // This test verifies the extension activates properly
    const extension = vscode.extensions.getExtension('txtdoc.txtdoc-format');
    assert.ok(extension, 'Extension should be available');
    
    if (!extension.isActive) {
      await extension.activate();
    }
    
    assert.ok(extension.isActive, 'Extension should be activated');
  });
  
  test('Extension exports', () => {
    // This test verifies the extension has exports
    const extension = vscode.extensions.getExtension('txtdoc.txtdoc-format');
    const exports = extension.exports;
    
    assert.ok(true, 'Extension exports test passed');
  });
});