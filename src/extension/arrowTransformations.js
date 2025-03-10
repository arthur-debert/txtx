const vscode = require("vscode");
const { ARROW_TRANSFORMATIONS } = require("./constants");

/**
 * Register the arrow transformation feature
 * @param {vscode.ExtensionContext} context 
 * @param {vscode.OutputChannel} outputChannel
 */
function registerArrowTransformations(context, outputChannel) {
    // Register a text document change listener
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(async (event) => {
            // Only process txtdoc files
            if (event.document.languageId !== 'txtdoc') return;
            
            // Check if any of the changes might contain arrow notations
            const containsArrowNotation = event.contentChanges.some(change => {
                return ARROW_TRANSFORMATIONS.some(transform => 
                    transform.pattern.test(change.text));
            });
            
            // If no potential arrow notations, skip processing
            if (!containsArrowNotation) return;
            
            // Process the document for arrow transformations
            await transformArrows(event.document);
        })
    );
    
    // Also register a document save listener to ensure arrows are transformed on save
    context.subscriptions.push(
        vscode.workspace.onWillSaveTextDocument(async (event) => {
            if (event.document.languageId === 'txtdoc') {
                // Add a task to transform arrows before saving
                event.waitUntil(transformArrows(event.document));
            }
        })
    );
    
    // Process the active document on activation
    if (vscode.window.activeTextEditor && 
        vscode.window.activeTextEditor.document.languageId === 'txtdoc') {
        transformArrows(vscode.window.activeTextEditor.document);
    }
    
    outputChannel.appendLine('Arrow transformation feature registered');
}

/**
 * Transform arrow notations in a document to Unicode arrows
 * @param {vscode.TextDocument} document - The document to transform
 * @returns {Promise<vscode.TextEdit[]>} - The text edits to apply
 */
async function transformArrows(document) {
    const text = document.getText();
    const edits = [];
    
    // Find and replace all arrow notations
    for (const transform of ARROW_TRANSFORMATIONS) {
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
    registerArrowTransformations,
    transformArrows
};