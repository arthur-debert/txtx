import * as vscode from "vscode";
import { FOOTNOTE_REGEX, FOOTNOTE_REFERENCE_REGEX } from "./constants";
import { sendNotification } from "./notifications";

// Define interface for footnote declaration
interface FootnoteDeclaration {
    originalNumber: string;
    text: string;
    position: number;
}

/**
 * Number footnotes sequentially and update references
 * @param document - The document to process
 * @returns - Whether the operation was successful
 */
async function numberFootnotes(document: vscode.TextDocument): Promise<boolean> {
    // Only process RFC files
    if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
        sendNotification('FOOTNOTE_RFC_ONLY');
        return false;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        sendNotification('FOOTNOTE_NO_EDITOR');
        return false;
    }

    try {
        // Get the entire document text
        const text = document.getText();
        
        // Find all footnote declarations and their positions
        const footnoteDeclarations: FootnoteDeclaration[] = [];
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
        const footnoteMap: Record<string, string> = {};
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
        
        sendNotification('FOOTNOTE_SUCCESS');
        return true;
    } catch (error) {
        sendNotification('FOOTNOTE_ERROR', error);
        return false;
    }
}

/**
 * Register the number footnotes command
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerFootnoteCommands(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): void {
    // Register the number footnotes command
    const numberFootnotesCommand = vscode.commands.registerCommand('rfcdoc.numberFootnotes', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'rfcdoc') {
            outputChannel.appendLine('Executing Number Footnotes command');
            await numberFootnotes(editor.document);
        } else {
            sendNotification('FOOTNOTE_RFCDOC_ONLY');
        }
    });
    
    context.subscriptions.push(numberFootnotesCommand);
    outputChannel.appendLine('Number Footnotes command registered');
}

export {
    registerFootnoteCommands,
    numberFootnotes
};