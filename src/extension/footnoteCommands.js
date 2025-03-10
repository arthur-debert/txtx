const vscode = require("vscode");
const { FOOTNOTE_REGEX, FOOTNOTE_REFERENCE_REGEX } = require("./constants");

/**
 * Number footnotes sequentially and update references
 * @param {vscode.TextDocument} document - The document to process
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
async function numberFootnotes(document) {
    // Only process RFC files
    if (document.languageId !== 'txtdoc' || !document.fileName.endsWith('.rfc')) {
        vscode.window.showWarningMessage('Number Footnotes command is only available for .rfc files');
        return false;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return false;
    }

    try {
        // Get the entire document text
        const text = document.getText();
        
        // Find all footnote declarations and their positions
        const footnoteDeclarations = [];
        let match;
        
        // Reset the regex lastIndex
        FOOTNOTE_REGEX.lastIndex = 0;
        while ((match = FOOTNOTE_REGEX.exec(text)) !== null) {
            const footnoteNumber = match[1];
            const footnoteText = match[2];
            const position = match.index;
            
            footnoteDeclarations.push({
                originalNumber: footnoteNumber,
                text: footnoteText,
                position: position
            });
        }
        
        // Sort footnote declarations by their position in the document
        footnoteDeclarations.sort((a, b) => a.position - b.position);
        
        // Create a mapping from original footnote numbers to new sequential numbers
        const footnoteMap = {};
        for (let i = 0; i < footnoteDeclarations.length; i++) {
            footnoteMap[footnoteDeclarations[i].originalNumber] = (i + 1).toString();
        }
        
        // Create a new document text with updated footnote numbers
        let newText = '';
        let lastIndex = 0;
        
        // Process the text character by character
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '[' && i + 1 < text.length && /\d/.test(text[i + 1])) {
                // Found a potential footnote reference or declaration
                let j = i + 1;
                let numStr = '';
                while (j < text.length && /\d/.test(text[j])) {
                    numStr += text[j];
                    j++;
                }
                
                if (j < text.length && text[j] === ']') {
                    // This is a footnote reference or declaration
                    const originalNumber = numStr;
                    const newNumber = footnoteMap[originalNumber];
                    
                    if (newNumber) {
                        newText += text.substring(lastIndex, i) + '[' + newNumber + ']';
                        lastIndex = j + 1;
                        i = j;
                    }
                }
            }
        }
        
        // Add any remaining text
        if (lastIndex < text.length) {
            newText += text.substring(lastIndex);
        }
        
        // Replace the entire document text
        const fullRange = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
        );
        await editor.edit(editBuilder => {
            editBuilder.replace(fullRange, newText);
        });
        
        vscode.window.showInformationMessage('Footnotes numbered successfully');
        return true;
    } catch (error) {
        vscode.window.showErrorMessage(`Error numbering footnotes: ${error.message}`);
        return false;
    }
}

/**
 * Register the number footnotes command
 * @param {vscode.ExtensionContext} context - The extension context
 * @param {vscode.OutputChannel} outputChannel - The output channel
 */
function registerFootnoteCommands(context, outputChannel) {
    // Register the number footnotes command
    const numberFootnotesCommand = vscode.commands.registerCommand('txtdoc.numberFootnotes', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'txtdoc') {
            outputChannel.appendLine('Executing Number Footnotes command');
            await numberFootnotes(editor.document);
        } else {
            vscode.window.showWarningMessage('Number Footnotes command is only available for TxtDoc files');
        }
    });
    
    context.subscriptions.push(numberFootnotesCommand);
    outputChannel.appendLine('Number Footnotes command registered');
}

module.exports = {
    registerFootnoteCommands,
    numberFootnotes
};