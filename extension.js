// The module 'vscode' contains the VS Code extensibility API
const vscode = require("vscode");

// Regular expressions for matching different elements
const SECTION_REGEX = /^([A-Z][^\n]*)$/gm;
const CODE_BLOCK_START_REGEX = /^(\s{4}.*)/gm;
const QUOTE_REGEX = /^>\s+(.+)$/gm;
const NESTED_QUOTE_REGEX = /^>>\s+(.+)$/gm;

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
    
    // Register document symbol provider for outline support
    const documentSymbolProvider = new TxtDocDocumentSymbolProvider();
    const selector = { language: 'txtdoc', scheme: 'file' };
    
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(selector, documentSymbolProvider)
    );
    
    outputChannel.appendLine('Document symbol provider registered for outline support');
    
    console.log('TxtDoc Format extension activated');
}

/**
 * Document Symbol Provider for TxtDoc files
 * Provides outline support for titles, sections, and code blocks
 */
class TxtDocDocumentSymbolProvider {
    provideDocumentSymbols(document, token) {
        const symbols = [];
        const text = document.getText();
        let match;

        // Find sections
        SECTION_REGEX.lastIndex = 0;
        while ((match = SECTION_REGEX.exec(text)) !== null) {
            if (token.isCancellationRequested) {
                return [];
            }
            
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            
            const symbol = new vscode.DocumentSymbol(
                match[1].trim(),
                'Section',
                vscode.SymbolKind.File,
                range,
                range
            );
            
            symbols.push(symbol);
        }
        
        // Find code blocks
        CODE_BLOCK_START_REGEX.lastIndex = 0;
        while ((match = CODE_BLOCK_START_REGEX.exec(text)) !== null) {
            if (token.isCancellationRequested) {
                return [];
            }
            
            // Find the end of the code block
            let blockEnd = match.index + match[0].length;
            let nextLine = text.indexOf('\n', blockEnd);
            
            while (nextLine !== -1 && text.substring(nextLine + 1, nextLine + 5).match(/^\s{4}/)) {
                blockEnd = nextLine;
                nextLine = text.indexOf('\n', blockEnd + 1);
            }
            
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(blockEnd);
            const range = new vscode.Range(startPos, endPos);
            
            // Extract the first line of the code block for the name
            const firstLine = match[1].trim();
            const blockName = firstLine.length > 0 ? firstLine : 'Code Block';
            
            const symbol = new vscode.DocumentSymbol(
                blockName,
                'Code Block',
                vscode.SymbolKind.Function,
                range,
                range
            );
            
            // Add code block to the appropriate parent if it exists
            const parentSymbol = this.findParentSymbol(symbols, startPos);
            if (parentSymbol && parentSymbol.kind === vscode.SymbolKind.File) {
                parentSymbol.children.push(symbol);
            } else {
                symbols.push(symbol);
            }
        }
        
        return symbols;
    }
    
    /**
     * Find the parent symbol for a given position
     * @param {vscode.DocumentSymbol[]} symbols - The list of symbols
     * @param {vscode.Position} position - The position to find a parent for
     * @returns {vscode.DocumentSymbol|null} - The parent symbol or null if not found
     */
    findParentSymbol(symbols, position) {
        for (const symbol of symbols) {
            if (symbol.range.contains(position) && 
                symbol.kind === vscode.SymbolKind.File) {
                return symbol;
            }
        }
        return null;
    }
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
