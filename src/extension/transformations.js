const vscode = require("vscode");
const { loadYamlFile } = require("./yamlLoader");

// Will be populated from YAML file
let transformations = [];

/**
 * Register the transformations feature
 * @param {vscode.ExtensionContext} context 
 * @param {vscode.OutputChannel} outputChannel
 */
function registerTransformations(context, outputChannel) {
    // Load transformations from YAML file
    transformations = loadYamlFile('src/extension/transforms.yaml', outputChannel);
    
    // Convert array format to objects with RegExp patterns
    transformations.forEach(transform => {
        const [pattern, replacement] = transform;
        transform.pattern = new RegExp(pattern, 'g');
        transform.replacement = replacement;
    });
    
    outputChannel.appendLine(`Loaded ${transformations.length} transformations`);
    
    // Register a text document change listener
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(async (event) => {
            // Only process txtdoc files
            if (event.document.languageId !== 'txtdoc') return;
            
            // Check if any of the changes might contain transformation patterns
            const containsTransformationPattern = event.contentChanges.some(change => {
                return transformations.some(transform => 
                    transform.pattern.test(change.text));
            });
            
            // If no potential transformation patterns, skip processing
            if (!containsTransformationPattern) return;
            
            // Process the document for transformations
            await applyTransformations(event.document);
        })
    );
    
    // Also register a document save listener to ensure transformations are applied on save
    context.subscriptions.push(
        vscode.workspace.onWillSaveTextDocument(async (event) => {
            if (event.document.languageId === 'txtdoc') {
                // Add a task to apply transformations before saving
                event.waitUntil(applyTransformations(event.document));
            }
        })
    );
    
    // Process the active document on activation
    if (vscode.window.activeTextEditor && 
        vscode.window.activeTextEditor.document.languageId === 'txtdoc') {
        applyTransformations(vscode.window.activeTextEditor.document);
    }
    
    outputChannel.appendLine('Transformations feature registered');
}

/**
 * Apply transformations in a document
 * @param {vscode.TextDocument} document - The document to transform
 * @returns {Promise<vscode.TextEdit[]>} - The text edits to apply
 */
async function applyTransformations(document) {
    const text = document.getText();
    const edits = [];
    
    // Find and replace all transformation patterns
    for (const transform of transformations) {
        transform.pattern.lastIndex = 0; // Reset regex state
        let match;
        while ((match = transform.pattern.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            edits.push(vscode.TextEdit.replace(range, transform.replacement));
        }
    }
    
    // Apply the edits if there are any
    if (edits.length > 0) {
        const workspaceEdit = new vscode.WorkspaceEdit();
        edits.forEach(edit => workspaceEdit.replace(document.uri, edit.range, edit.newText));
        await vscode.workspace.applyEdit(workspaceEdit);
    }
    
    return edits;
}

module.exports = {
    registerTransformations,
    applyTransformations
};