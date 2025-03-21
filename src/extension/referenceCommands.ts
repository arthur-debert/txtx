import * as vscode from 'vscode';
import { sendNotification } from './notifications.js';
import * as vscodeLib from './vscode.lib.js';

/**
 * Register the check references command
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerReferenceCommands(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): void {
  // Register the check references command
  vscodeLib.registerCommand(
    context,
    'txxt.checkReferences',
    async (document: vscode.TextDocument) => {
      try {
        // Use the core API to check references
        const success = await vscodeLib.checkReferences(document);

        if (!success) {
          sendNotification('REFERENCE_ERROR', 'Failed to check references');
        }

        return success;
      } catch (error) {
        sendNotification('REFERENCE_ERROR', error instanceof Error ? error : new Error('Unknown error during reference check'));
        return false;
      }
    },
    outputChannel
  );

  // Log registration
  outputChannel.appendLine('Check References command registered');
}

export { registerReferenceCommands };
