import * as vscode from "vscode";
import { sendNotification } from "./notifications";
import * as vscodeLib from "./vscode.lib";
import { fixNumbering } from "../features/numbering";

/**
 * Fix numbering in ordered lists and section headers
 * @param document - The document to fix numbering in
 * @returns - Whether the numbering fix was successful
 */
async function fixNumbering_VSCode(document: vscode.TextDocument): Promise<boolean> {
    // Only fix numbering in RFC files
    if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
        sendNotification('NUMBERING_RFC_ONLY');
        return false;
    }

    const editor = vscodeLib.getActiveEditor();
    if (!editor) {
        sendNotification('NUMBERING_NO_EDITOR');
        return false;
    }

    try {
        // Get the entire document text
        const text = document.getText();
        
        // Apply numbering fixes using the feature
        const result = fixNumbering(text);
        
        if (!result.success || !result.fixedText) {
            sendNotification('NUMBERING_ERROR', result.error);
            return false;
        }
        
        // Replace the entire document text
        const fullRange = vscodeLib.getDocumentRange(document);
        
        await vscodeLib.applyEdit(editor, fullRange, result.fixedText);
        sendNotification('NUMBERING_SUCCESS', result.linesChanged);
        return true;
    } catch (error) {
        sendNotification('NUMBERING_ERROR', error);
        return false;
    }
}

/**
 * Register the numbering commands
 * @param context - The extension context
 * @param outputChannel - The output channel
 */
function registerNumberingCommands(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): void {
    // Register commands using vscodeLib
    const fixNumberingCommand = vscodeLib.registerCommand(
        context, 
        'rfcdoc.fixNumbering', 
        fixNumbering_VSCode, 
        outputChannel
    );
    
    // Log registration
    outputChannel.appendLine('Fix Numbering command registered');
}

export {
    registerNumberingCommands,
    fixNumbering_VSCode as fixNumbering
};