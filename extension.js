// The module 'vscode' contains the VS Code extensibility API
const vscode = require("vscode");

// Import the extension module
const extension = require("./src/extension");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Delegate to the modular extension
    return extension.activate(context);
}

function deactivate() {
    // Delegate to the modular extension
    return extension.deactivate();
}

module.exports = {
    activate,
    deactivate,
};
