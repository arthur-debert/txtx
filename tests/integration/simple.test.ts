/**
 * Simple integration test to verify the integration test setup works with VSCode
 */
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('Simple Integration Test Suite', () => {
  test('VSCode should be available', () => {
    assert.ok(vscode);
  });

  test('VSCode version should be defined', () => {
    assert.ok(vscode.version);
  });

  test('Extension should be activated', async () => {
    // Get the extension
    const extension = vscode.extensions.getExtension('txxt.txxt-format');
    assert.ok(extension, 'Extension should be available');

    // Ensure it's activated
    if (!extension.isActive) {
      await extension.activate();
    }

    assert.ok(extension.isActive, 'Extension should be activated');
  });

  test('Commands should be registered', async () => {
    // Get all commands
    const commands = await vscode.commands.getCommands();

    // Check for some of our extension commands
    assert.ok(
      commands.includes('txxt.formatDocument'),
      'formatDocument command should be registered'
    );
    assert.ok(commands.includes('txxt.generateTOC'), 'generateTOC command should be registered');
  });
});
