import * as vscode from 'vscode';
import * as path from 'path';
import { sendNotification } from './notifications';

/**
 * Register the launch command
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerLaunchCommands(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): void {
  // Register the launch command
  const launchCommand = vscode.commands.registerCommand('txxt.launch', async () => {
    try {
      // Get the workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        sendNotification('ERROR', 'No workspace folder found');
        return;
      }

      // Ask the user for a branch name
      const branchName = await vscode.window.showInputBox({
        prompt: 'Enter a new branch name',
        placeHolder: 'feature/my-new-feature',
        validateInput: value => {
          if (!value || value.trim() === '') {
            return 'Branch name cannot be empty';
          }
          if (value.includes(' ')) {
            return 'Branch name cannot contain spaces';
          }
          return null;
        },
      });

      // If the user cancelled, return
      if (!branchName) {
        return;
      }

      outputChannel.appendLine(`Launching with branch name: ${branchName}`);
      outputChannel.show();

      // Create a terminal and run the command
      const terminal = vscode.window.createTerminal('txxt Launch');
      terminal.show();

      // Run the dev-post-merge script with the branch name
      const scriptPath = path.join(workspaceFolder.uri.fsPath, 'bin', 'dev-post-merge');
      terminal.sendText(`${scriptPath} ${branchName}`);

      // Show a notification
      vscode.window.showInformationMessage(`Launching with branch: ${branchName}`);
    } catch (error) {
      outputChannel.appendLine(`Error launching: ${error}`);
      sendNotification('ERROR', `Failed to launch: ${error}`);
    }
  });

  context.subscriptions.push(launchCommand);
  outputChannel.appendLine('Launch command registered');
}

export { registerLaunchCommands };
