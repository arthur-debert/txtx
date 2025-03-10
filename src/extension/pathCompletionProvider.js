const vscode = require("vscode");
const path = require("path");
const { PATH_COMPLETION_TRIGGERS } = require("./constants");

/**
 * Register the path completion provider
 * @param {vscode.ExtensionContext} context 
 * @param {vscode.OutputChannel} outputChannel
 */
function registerPathCompletionProvider(context, outputChannel) {
    // Register completion provider for file/folder paths
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        { language: 'txtdoc', scheme: 'file' },
        {
            async provideCompletionItems(document, position, token, context) {
                // Check if we're in a path context
                const linePrefix = document.lineAt(position).text.substring(0, position.character);
                
                // Check if we're typing a path
                const pathMatch = linePrefix.match(/(?:^|\s)([\.\/][\.\/\w-]*)$/);
                if (!pathMatch) {
                    return undefined;
                }
                
                const pathPrefix = pathMatch[1];
                return await getPathCompletionItems(document.uri, pathPrefix);
            }
        },
        ...PATH_COMPLETION_TRIGGERS
    );
    
    context.subscriptions.push(completionProvider);
    outputChannel.appendLine('Path completion provider registered');
}

/**
 * Get completion items for file/folder paths
 * @param {vscode.Uri} documentUri - The URI of the current document
 * @param {string} pathPrefix - The path prefix to complete
 * @returns {Promise<vscode.CompletionItem[]>} - The completion items
 */
async function getPathCompletionItems(documentUri, pathPrefix) {
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
                const item = new vscode.CompletionItem(name, fileType === vscode.FileType.Directory ? 
                    vscode.CompletionItemKind.Folder : vscode.CompletionItemKind.File);
                item.detail = fileType === vscode.FileType.Directory ? 'Directory' : 'File';
                return item;
            });
    } catch (error) {
        outputChannel.appendLine(`Path completion error: ${error.message}`);
        return [];
    }
}

module.exports = {
    registerPathCompletionProvider,
    getPathCompletionItems
};