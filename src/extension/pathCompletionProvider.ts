import * as vscode from 'vscode';
import * as path from 'path';
import { PATH_COMPLETION_TRIGGERS } from './constants.js';
import * as vscodeLib from './vscode.lib.js';

/**
 * Register the path completion provider
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerPathCompletionProvider(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): void {
  // Register completion provider for file/folder paths using vscodeLib
  vscodeLib.registerCompletionItemProvider(
    context,
    { language: 'txxt', scheme: 'file' },
    {
      async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ): Promise<vscode.CompletionItem[] | undefined> {
        // Check if we're in a path context
        const linePrefix = document.lineAt(position).text.substring(0, position.character);

        // Check if we're typing a path
        const filePattern = /^(\.\.?\/|[a-zA-Z]:|\/)([\w.-/]+\/)*[\w.-]*$/;
        const pathMatch = linePrefix.match(filePattern);
        if (!pathMatch) {
          return undefined;
        }

        const pathPrefix = pathMatch[1];
        return await getPathCompletionItems(document.uri, pathPrefix, outputChannel);
      },
    },
    PATH_COMPLETION_TRIGGERS,
    outputChannel
  );
}

/**
 * Get completion items for file/folder paths
 * @param documentUri - The URI of the current document
 * @param pathPrefix - The path prefix to complete
 * @param outputChannel - The output channel for logging errors
 * @returns - The completion items
 */
async function getPathCompletionItems(
  documentUri: vscode.Uri,
  pathPrefix: string,
  outputChannel: vscode.OutputChannel
): Promise<vscode.CompletionItem[]> {
  try {
    // Get the workspace folder containing the document
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
    if (!workspaceFolder) {
      return [];
    }

    // Determine the base directory for path completion
    let basePath = workspaceFolder.uri.fsPath;
    let relativePath = '';

    if (pathPrefix.startsWith('./') || pathPrefix.startsWith('../')) {
      // For relative paths, use the document's directory as base
      const documentDir = path.dirname(documentUri.fsPath);
      basePath = documentDir;
      relativePath = pathPrefix;
    } else if (pathPrefix.startsWith('/')) {
      // For absolute paths (within workspace), use workspace root
      relativePath = pathPrefix.substring(1); // Remove leading slash
    } else {
      // Default to current directory
      relativePath = pathPrefix;
    }

    // Resolve the target directory
    const targetDir = path.resolve(basePath, path.dirname(relativePath));
    const searchPattern = path.basename(relativePath);

    // Get files and folders in the target directory
    const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(targetDir));

    // Create completion items
    return files
      .filter(([name]) => name.startsWith(searchPattern))
      .map(([name, fileType]) => {
        const item = new vscode.CompletionItem(
          name,
          fileType === vscode.FileType.Directory
            ? vscode.CompletionItemKind.Folder
            : vscode.CompletionItemKind.File
        );
        item.detail = fileType === vscode.FileType.Directory ? 'Directory' : 'File';
        return item;
      });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    outputChannel.appendLine(`Path completion error: ${errorMessage}`);
    return [];
  }
}

export { registerPathCompletionProvider, getPathCompletionItems };
