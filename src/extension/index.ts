import * as vscode from "vscode";
import RfcDocDocumentSymbolProvider from "./documentSymbolProvider";
import RfcDocDocumentLinkProvider from "./documentLinkProvider";
import { registerTransformations } from "./transformations";
import { registerInsertions } from "./insertions";
import { registerPathCompletionProvider } from "./pathCompletionProvider";
import { registerFormatCommands } from "./formatCommands";
import { registerFootnoteCommands } from "./footnoteCommands";
import { registerExportCommands } from "./exportCommands";
import { registerReferenceCommands } from "./referenceCommands";
import { registerNumberingCommands } from "./numberingCommands";
import { fixDocumentNumbering } from "../core/backends/headless/numbering-commands";
import * as vscodeLib from "./vscode.lib";

let outputChannel: vscode.OutputChannel;

/**
 * Activate the extension
 * @param context - The extension context
 */
export function activate(context: vscode.ExtensionContext): void {
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
    
    // Register the export commands
    registerExportCommands(context, outputChannel);

    // Register the numbering commands
    registerNumberingCommands(context, outputChannel);
    
    // Register internal command for numbering fix
    // This is used by the vscode.lib.ts fixNumbering function
    context.subscriptions.push(
        vscode.commands.registerCommand('rfcdoc.fixNumbering.internal', async (text: string, filePath: string) => {
            return await fixDocumentNumbering(text, filePath);
        })
    );
    outputChannel.appendLine('Internal numbering fix command registered');
    
    console.log('RfcDoc Format extension activated');
}

/**
 * Deactivate the extension
 */
export function deactivate(): void {
    if (outputChannel) {
        outputChannel.appendLine('RfcDoc Format extension is now deactivated!');
        outputChannel.dispose();
    }
}