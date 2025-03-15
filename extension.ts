// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";

// Import the extension module
import * as extension from './src/extension/index.js';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
    // Delegate to the modular extension
    return extension.activate(context);
}

export function deactivate() {
    // Delegate to the modular extension
    return extension.deactivate();
}