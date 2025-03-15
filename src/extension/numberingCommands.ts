import * as vscode from 'vscode';
import { sendNotification } from './notifications';
import * as vscodeLib from './vscode.lib';

/**
 * Register the numbering commands
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerNumberingCommands(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): void {
  // Register commands using vscodeLib
  const fixNumberingCommand = vscodeLib.registerCommand(
    context,
    'txxt.fixNumbering',
    async (document: vscode.TextDocument) => {
      try {
        // Use the vscodeLib to fix numbering
        // This will internally use the core API with proper type handling
        const success = await vscodeLib.fixNumbering(document);

        if (!success) {
          sendNotification('NUMBERING_ERROR', 'Failed to fix numbering');
        }

        return success;
      } catch (error) {
        sendNotification('NUMBERING_ERROR', error);
        return false;
      }
    },
    outputChannel
  );

  // Log registration
  outputChannel.appendLine('Fix Numbering command registered');
}

export { registerNumberingCommands };
