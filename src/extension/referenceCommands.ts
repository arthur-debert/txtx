import * as vscode from "vscode";
import { sendNotification } from "./notifications";
import * as vscodeLib from "./vscode.lib";

/**
 * Register the check references command
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerReferenceCommands(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): void {
  // Register the check references command
  const checkReferencesCommand = vscodeLib.registerCommand(
    context, 
    'rfcdoc.checkReferences', 
    async (document: vscode.TextDocument) => {
      try {
        // Use the core API to check references
        const success = await vscodeLib.checkReferences(document);
        
        if (!success) {
          sendNotification('REFERENCE_ERROR', 'Failed to check references');
        }
        
        return success;
      } catch (error) {
        sendNotification('REFERENCE_ERROR', error);
        return false;
      }
    }, 
    outputChannel
  );
  
  // Log registration
  outputChannel.appendLine('Check References command registered');
}

export {
  registerReferenceCommands
};