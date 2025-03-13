import * as vscode from "vscode";
import { sendNotification } from "./notifications";
import processFootnotes from "../features/footnotes";

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
        const text = document.getText();
        
        // Process the footnotes using the feature
        const result = processFootnotes(text);
        
        if (!result.success) {
            sendNotification('FOOTNOTE_ERROR', result.error);
            return false;
        }
        
        // Replace the entire document text
        const fullRange = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
        );
        await editor.edit((editBuilder) => {
            const newText = result.newText || text;
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