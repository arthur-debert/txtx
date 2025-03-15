import * as vscode from 'vscode';
import * as vscodeLib from './vscode.lib.js';
import { numberFootnotes } from '../core/backends/vscode-live/index.js';

/**
 * Register the number footnotes command
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerFootnoteCommands(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): void {
  // Register the number footnotes command using the core API
  vscodeLib.registerCommand(
    context,
    'txxt.numberFootnotes',
    numberFootnotes,
    outputChannel
  );
}

export { registerFootnoteCommands };
