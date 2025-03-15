import * as vscode from 'vscode';
import { sendNotification } from './notifications.js';
import * as vscodeLib from './vscode.lib.js';

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
  vscodeLib.registerCommand(
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
        sendNotification('NUMBERING_ERROR', error instanceof Error ? error : new Error('Unknown error during numbering'));
        return false;
      }
    },
    outputChannel
  );

  // Log registration
  outputChannel.appendLine('Fix Numbering command registered');
}

export { registerNumberingCommands };
