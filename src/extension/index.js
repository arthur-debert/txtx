const vscode = require("vscode");
const RfcDocDocumentSymbolProvider = require("./documentSymbolProvider");
const RfcDocDocumentLinkProvider = require("./documentLinkProvider");
const { registerTransformations } = require("./transformations");
const { registerInsertions } = require("./insertions");
const { registerPathCompletionProvider } = require("./pathCompletionProvider");
const { registerFormatCommands } = require("./formatCommands");
const { registerFootnoteCommands } = require("./footnoteCommands");
const { registerReferenceCommands } = require("./referenceCommands");
const vscodeLib = require("./vscode.lib");

let outputChannel;

/**
 * Activate the extension
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {
    // Create output channel
    outputChannel = vscodeLib.createOutputChannel('txtos');
    context.subscriptions.push(outputChannel);
    
    // Log activation
    outputChannel.appendLine('RfcDoc Format extension is now active!');
    outputChannel.appendLine(`Activated at: ${new Date().toLocaleString()}`);
    
    // Register document symbol provider for outline support
    const documentSymbolProvider = new RfcDocDocumentSymbolProvider();
    const selector = { language: 'rfcdoc', scheme: 'file' };
    
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(selector, documentSymbolProvider)
    );

    // Register document link provider for footnotes and references
    const documentLinkProvider = new RfcDocDocumentLinkProvider();
    context.subscriptions.push(
        vscode.languages.registerDocumentLinkProvider(selector, documentLinkProvider)
    );
    
    outputChannel.appendLine('Document symbol provider registered for outline support');
    outputChannel.appendLine('Document link provider registered for footnotes and references');
    
    // Register the transformations feature
    registerTransformations(context, outputChannel);
    
    // Register the insertions feature
    registerInsertions(context, outputChannel);
    
    // Register the path completion provider
    registerPathCompletionProvider(context, outputChannel);
    
    // Register the format commands
    registerFormatCommands(context, outputChannel);

    // Register the footnote commands
    registerFootnoteCommands(context, outputChannel);
    
    // Register the reference commands
    registerReferenceCommands(context, outputChannel);
    
    console.log('RfcDoc Format extension activated');
}

/**
 * Deactivate the extension
 */
function deactivate() {
    if (outputChannel) {
        outputChannel.appendLine('RfcDoc Format extension is now deactivated!');
        outputChannel.dispose();
    }
}

module.exports = {
    activate,
    deactivate
};