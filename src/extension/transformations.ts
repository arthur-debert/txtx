import * as vscode from "vscode";
import { loadYamlFile } from "./yamlLoader";

// Define interface for transformation objects
interface Transformation {
    pattern: RegExp;
    replacement: string;
    [key: number]: string; // For array-like access (pattern at index 0, replacement at index 1)
}

// Will be populated from YAML file
let transformations: Transformation[] = [];

/**
 * Register the transformations feature
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerTransformations(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): void {
    // Load transformations from YAML file
    const transformsData = loadYamlFile('src/extension/transforms.yaml', outputChannel) as string[][];
    
    // Convert array format to objects with RegExp patterns
    transformations = transformsData.map(transform => {
        const [pattern, replacement] = transform;
        return {
            0: pattern,
            1: replacement,
            pattern: new RegExp(pattern, 'g'),
            replacement
        };
    });
    
    outputChannel.appendLine(`Loaded ${transformations.length} transformations`);
    
    // Register a text document change listener
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(async (event) => {
            // Only process rfcdoc files
            if (event.document.languageId !== 'rfcdoc') return;
            
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
            if (event.document.languageId === 'rfcdoc') {
                // Add a task to apply transformations before saving
                event.waitUntil(applyTransformations(event.document));
            }
        })
    );
    
    // Process the active document on activation
    if (vscode.window.activeTextEditor && 
        vscode.window.activeTextEditor.document.languageId === 'rfcdoc') {
        applyTransformations(vscode.window.activeTextEditor.document);
    }
    
    outputChannel.appendLine('Transformations feature registered');
}

/**
 * Apply transformations in a document
 * @param document - The document to transform
 * @returns - The text edits to apply
 */
async function applyTransformations(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
    const text = document.getText();
    const edits: vscode.TextEdit[] = [];
    
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

export {
    registerTransformations,
    applyTransformations
};