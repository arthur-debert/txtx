/**
 * VSCode Library - Common utilities for VSCode extensions and tests
 * 
 * This library provides reusable functions for common operations in VSCode extensions
 * and their tests, reducing code duplication and improving maintainability.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { sendNotification } from './notifications';
import { getErrorMessage } from '../core/error-utils';
import * as coreApi from '../core/api';
import { NumberingFixResult } from '../features/numbering/types';

/**
 * Interface for section information
 */
export interface Section {
  name: string;
  level: number;
  line: number;
  prefix: string;
}

/**
 * Interface for document section with range
 */
export interface DocumentSection {
  name: string;
  level: number;
  range: vscode.Range;
  prefix: string;
}

/**
 * Document Operations
 */

/**
 * Open a document in the editor
 * @param filePath - The path to the file to open
 * @returns - The opened document
 */
export async function openDocument(filePath: string): Promise<vscode.TextDocument> {
  const uri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
  return document;
}

/**
 * Get the active text editor
 * @returns - The active text editor or null if none
 */
export function getActiveEditor(): vscode.TextEditor | undefined {
  return vscode.window.activeTextEditor;
}

/**
 * Wait for the language mode to be set
 * @param timeout - The timeout in milliseconds
 * @returns - A promise that resolves when the timeout is reached
 */
export async function waitForLanguageMode(timeout: number = 1000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

/**
 * Close the active editor
 * @returns - A promise that resolves when the editor is closed
 */
export async function closeActiveEditor(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

/**
 * Apply an edit to a document
 * @param editor - The editor to apply the edit to
 * @param range - The range to replace
 * @param text - The text to replace with
 * @returns - Whether the edit was applied
 */
export async function applyEdit(editor: vscode.TextEditor, range: vscode.Range, text: string): Promise<boolean> {
  return await editor.edit(editBuilder => {
    editBuilder.replace(range, text);
  });
}

/**
 * Get the full range of a document
 * @param document - The document to get the range for
 * @returns - The full range of the document
 */
export function getDocumentRange(document: vscode.TextDocument): vscode.Range {
  return new vscode.Range(
    new vscode.Position(0, 0),
    new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
  );
}

/**
 * Section/Symbol Operations
 */

/**
 * Get document sections using the document symbol provider
 * @param document - The document to get sections for
 * @returns - The sections
 */
export async function getDocumentSections(document: vscode.TextDocument): Promise<DocumentSection[]> {
  // Get document symbols
  const symbols = await vscode.commands.executeCommand(
    'vscode.executeDocumentSymbolProvider',
    document.uri
  ) as vscode.DocumentSymbol[];
  
  if (!symbols || symbols.length === 0) {
    return [];
  }
  
  // Process symbols to extract section information
  const sections: DocumentSection[] = [];
  
  for (const symbol of symbols) {
    // Determine section level
    let level = 1;
    let prefix = '';
    
    // Check if it's a numbered section
    const numberedMatch = symbol.name.match(/^(\d+(?:\.\d+)*)\. (.+)$/);
    if (numberedMatch) {
      const sectionNumber = numberedMatch[1];
      level = sectionNumber.split('.').length;
      prefix = sectionNumber + '.';
    } else if (symbol.name.match(/^: /)) {
      // Alternative section
      prefix = ':';
    }
    
    sections.push({
      name: symbol.name,
      level,
      range: symbol.range,
      prefix
    });
  }
  
  // Sort sections by line number
  sections.sort((a, b) => a.range.start.line - b.range.start.line);
  
  return sections;
}

/**
 * Find sections in document text
 * @param text - The document text
 * @param sectionRegex - The regex to match sections
 * @param numberedSectionRegex - The regex to match numbered sections
 * @param alternativeSectionRegex - The regex to match alternative sections
 * @returns - The sections
 */
export function findSections(
  text: string, 
  sectionRegex: RegExp, 
  numberedSectionRegex: RegExp, 
  alternativeSectionRegex: RegExp
): Section[] {
  const sections: Section[] = [];
  const lines = text.split('\n');
  
  // Find uppercase sections
  sectionRegex.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(text)) !== null) {
    const lineIndex = text.substring(0, match.index).split('\n').length - 1;
    sections.push({
      name: match[1].trim(),
      level: 1,
      line: lineIndex,
      prefix: ''
    });
  }
  
  // Find numbered sections
  numberedSectionRegex.lastIndex = 0;
  while ((match = numberedSectionRegex.exec(text)) !== null) {
    const lineIndex = text.substring(0, match.index).split('\n').length - 1;
    const sectionNumber = match[1];
    const sectionTitle = match[2].trim();
    const sectionLevel = sectionNumber.split('.').length;
    
    sections.push({
      name: `${sectionNumber}. ${sectionTitle}`,
      level: sectionLevel,
      line: lineIndex,
      prefix: `${sectionNumber}.`
    });
  }
  
  // Find alternative sections
  alternativeSectionRegex.lastIndex = 0;
  while ((match = alternativeSectionRegex.exec(text)) !== null) {
    const lineIndex = text.substring(0, match.index).split('\n').length - 1;
    sections.push({
      name: `: ${match[1].trim()}`,
      level: 1,
      line: lineIndex,
      prefix: ':'
    });
  }
  
  // Sort sections by line number
  sections.sort((a, b) => a.line - b.line);
  
  return sections;
}

/**
 * Command Operations
 */

/**
 * Execute a VSCode command
 * @param command - The command to execute
 * @param args - The arguments to pass to the command
 * @returns - The result of the command
 */
export async function executeCommand<T>(command: string, ...args: any[]): Promise<T> {
  return await vscode.commands.executeCommand<T>(command, ...args);
}

/**
 * Register a command
 * @param context - The extension context
 * @param command - The command to register
 * @param callback - The callback to execute when the command is invoked
 * @param outputChannel - The output channel to log to
 * @returns - The command registration
 */
export function registerCommand(
  context: vscode.ExtensionContext, 
  command: string, 
  callback: (document: vscode.TextDocument) => Promise<any>, 
  outputChannel?: vscode.OutputChannel
): vscode.Disposable {
  const commandRegistration = vscode.commands.registerCommand(command, async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'rfcdoc') {
      outputChannel?.appendLine(`Executing ${command} command`);
      await callback(editor.document);
    } else {
      sendNotification('FOOTNOTE_RFCDOC_ONLY');
    }
  });
  
  context.subscriptions.push(commandRegistration);
  outputChannel?.appendLine(`${command} command registered`);
  
  return commandRegistration;
}

/**
 * Diagnostic Operations
 */

/**
 * Create a diagnostic collection
 * @param name - The name of the diagnostic collection
 * @returns - The diagnostic collection
 */
export function createDiagnosticCollection(name: string): vscode.DiagnosticCollection {
  return vscode.languages.createDiagnosticCollection(name);
}

/**
 * Create a diagnostic
 * @param range - The range of the diagnostic
 * @param message - The message of the diagnostic
 * @param severity - The severity of the diagnostic
 * @returns - The diagnostic
 */
export function createDiagnostic(
  range: vscode.Range, 
  message: string, 
  severity: vscode.DiagnosticSeverity
): vscode.Diagnostic {
  return new vscode.Diagnostic(range, message, severity);
}

/**
 * Set diagnostics for a document
 * @param collection - The diagnostic collection
 * @param uri - The URI of the document
 * @param diagnostics - The diagnostics to set
 */
export function setDiagnostics(
  collection: vscode.DiagnosticCollection, 
  uri: vscode.Uri, 
  diagnostics: vscode.Diagnostic[]
): void {
  collection.set(uri, diagnostics);
}

/**
 * UI Operations
 */

/**
 * Create an output channel
 * @param name - The name of the output channel
 * @returns - The output channel
 */
export function createOutputChannel(name: string): vscode.OutputChannel {
  return vscode.window.createOutputChannel(name);
}

/**
 * Show an information message
 * @param message - The message to show
 * @returns - The selected item
 */
export function showInformationMessage(message: string): Promise<boolean> {
  return Promise.resolve(sendNotification('FORMAT_SUCCESS'));
}

/**
 * Show a warning message
 * @param message - The message to show
 * @returns - The selected item
 */
export function showWarningMessage(message: string): Promise<boolean> {
  return Promise.resolve(sendNotification('TOC_NO_SECTIONS'));
}

/**
 * Show an error message
 * @param message - The message to show
 * @returns - The selected item
 */
export function showErrorMessage(message: string): Promise<boolean> {
  return Promise.resolve(sendNotification('FORMAT_ERROR', new Error(message)));
}

/**
 * Wait for a condition to be true
 * @param condition - The condition to wait for
 * @param timeout - The timeout in milliseconds
 * @param interval - The interval to check the condition in milliseconds
 * @returns - Whether the condition was met
 */
export async function waitForCondition(
  condition: () => Promise<boolean> | boolean, 
  timeout: number = 5000, 
  interval: number = 100
): Promise<boolean> {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return false;
}

/**
 * Fix numbering in ordered lists and section headers
 * @param document - The VSCode document to process
 * @returns - Whether the operation was successful
 */
export async function fixNumbering(document: vscode.TextDocument): Promise<boolean> {
  try {
    // Only process RFC files
    if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
      sendNotification('NUMBERING_RFC_ONLY');
      return false;
    }

    const editor = getActiveEditor();
    if (!editor) {
      sendNotification('NUMBERING_NO_EDITOR');
      return false;
    }

    // Get the document text
    const text = document.getText();
    
    // Use the VSCode Live backend directly via command
    // This avoids type compatibility issues between VSCode and our API types
    const result = await vscode.commands.executeCommand<NumberingFixResult>('rfcdoc.fixNumbering.internal', text, document.fileName);

    // Validate the result
    if (!result || !result.success || !result.fixedText) {
      sendNotification('NUMBERING_ERROR', result?.error || 'Unknown error');
      return false;
    }
    
    // Replace the entire document text
    const fullRange = getDocumentRange(document);
    
    await applyEdit(editor, fullRange, result.fixedText as string);
    sendNotification('NUMBERING_SUCCESS', result.linesChanged);
    return true;
  } catch (error) {
    sendNotification('NUMBERING_ERROR', error);
    return false;
  }
}

/**
 * Check references in a document
 * @param document - The VSCode document to process
 * @returns - Whether the operation was successful
 */
export async function checkReferences(document: vscode.TextDocument): Promise<boolean> {
  try {
    // Only process RFC files
    if (document.languageId !== 'rfcdoc' || !document.fileName.endsWith('.rfc')) {
      sendNotification('REFERENCE_RFC_ONLY');
      return false;
    }

    const editor = getActiveEditor();
    if (!editor) {
      sendNotification('REFERENCE_NO_EDITOR');
      return false;
    }

    // Get the document text
    const text = document.getText();
    
    // Use the VSCode Live backend directly via command
    // This avoids type compatibility issues between VSCode and our API types
    const result = await vscode.commands.executeCommand('rfcdoc.checkReferences.internal', text, document.fileName);

    // The result is handled by the command itself (showing diagnostics, etc.)
    return result === true;
  } catch (error) {
    sendNotification('REFERENCE_ERROR', error);
    return false;
  }
}