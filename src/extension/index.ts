import * as vscode from 'vscode';
import txxtDocumentSymbolProvider from './documentSymbolProvider.js';
import txxtDocumentLinkProvider from './documentLinkProvider.js';
import { registerTransformations } from './transformations.js';
import { registerInsertions } from './insertions.js';
import { registerPathCompletionProvider } from './pathCompletionProvider.js';
import { registerFormatCommands } from './formatCommands.js';
import { registerFootnoteCommands } from './footnoteCommands.js';
import { registerExportCommands } from './exportCommands.js';
import { registerReferenceCommands } from './referenceCommands.js';
import { registerNumberingCommands } from './numberingCommands.js';
import { registerLaunchCommands } from './launchCommands.js';
import { fixDocumentNumbering } from '../core/backends/headless/numbering-commands.js';
import { checkDocumentReferences } from '../core/backends/headless/reference-commands.js';
import * as vscodeLib from './vscode.lib.js';

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
  outputChannel.appendLine('txxt Format extension is now active!');
  outputChannel.appendLine(`Activated at: ${new Date().toLocaleString()}`);

  // Register document symbol provider for outline support
  const documentSymbolProvider = new txxtDocumentSymbolProvider();
  const selector = { language: 'txxt', scheme: 'file' };

  // Use vscodeLib instead of direct vscode API
  vscodeLib.registerDocumentSymbolProvider(
    context,
    selector,
    documentSymbolProvider,
    outputChannel
  );

  // Register document link provider for footnotes and references
  const documentLinkProvider = new txxtDocumentLinkProvider();
  vscodeLib.registerDocumentLinkProvider(context, selector, documentLinkProvider, outputChannel);

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

  // Register the launch command
  registerLaunchCommands(context, outputChannel);

  // Register internal command for numbering fix
  // This is used by the vscode.lib.ts fixNumbering function
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'txxt.fixNumbering.internal',
      async (text: string, filePath: string) => {
        return await fixDocumentNumbering(text, filePath);
      }
    )
  );
  outputChannel.appendLine('Internal numbering fix command registered');

  // Register internal command for reference checking
  // This is used by the vscode.lib.ts checkReferences function
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'txxt.checkReferences.internal',
      async (text: string, filePath: string) => {
        return await checkDocumentReferences(text, filePath);
      }
    )
  );
  outputChannel.appendLine('Internal reference check command registered');

  console.log('txxt Format extension activated');
}

/**
 * Deactivate the extension
 */
export function deactivate(): void {
  if (outputChannel) {
    outputChannel.appendLine('txxt Format extension is now deactivated!');
    outputChannel.dispose();
  }
}
