import * as vscode from 'vscode';
import { sendNotification } from './notifications';
import * as vscodeLib from './vscode.lib';
import { formatCommands } from '../core/backends/vscode-live';

/**
 * Register the format document command
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerFormatCommands(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): void {
  // Register commands using vscodeLib
  const formatDocumentCommand = vscodeLib.registerCommand(
    context,
    'txxt.formatDocument',
    formatCommands.formatDocument,
    outputChannel
  );

  const generateTOCCommand = vscodeLib.registerCommand(
    context,
    'txxt.generateTOC',
    formatCommands.generateTOC,
    outputChannel
  );

  const fullFormattingCommand = vscodeLib.registerCommand(
    context,
    'txxt.fullFormatting',
    formatCommands.fullFormatting,
    outputChannel
  );

  // Log registration
  outputChannel.appendLine('Format Document command registered');
  outputChannel.appendLine('Generate TOC command registered');
  outputChannel.appendLine('Full Formatting command registered');
}

export { registerFormatCommands };
