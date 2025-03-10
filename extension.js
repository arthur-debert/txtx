// The module 'vscode' contains the VS Code extensibility API
const vscode = require("vscode");

let outputChannel;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Create output channel
    outputChannel = vscode.window.createOutputChannel('txtos');
    context.subscriptions.push(outputChannel);
    
    // Log activation
    outputChannel.appendLine('TxtDoc Format extension is now active!');
    outputChannel.appendLine(`Activated at: ${new Date().toLocaleString()}`);
    outputChannel.show();
    
    console.log('TxtDoc Format extension activated');
}

function deactivate() {
    if (outputChannel) {
        outputChannel.appendLine('TxtDoc Format extension is now deactivated!');
        outputChannel.dispose();
    }
}

module.exports = {
  activate,
  deactivate,
};
