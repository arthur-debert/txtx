import * as vscode from 'vscode';
import * as vscodeLib from './vscode.lib';
import { numberFootnotes } from '../core/backends/vscode-live';

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
  const numberFootnotesCommand = vscodeLib.registerCommand(
    context,
    'txxt.numberFootnotes',
    numberFootnotes,
    outputChannel
  );

  outputChannel.appendLine('Number Footnotes command registered');
}

export { registerFootnoteCommands, numberFootnotes };
