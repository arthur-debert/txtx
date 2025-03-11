/**
 * VSCode Library - Common utilities for VSCode extensions and tests
 * 
 * This library provides reusable functions for common operations in VSCode extensions
 * and their tests, reducing code duplication and improving maintainability.
 */

const vscode = require('vscode');
const path = require('path');
const { sendNotification } = require('./notifications');

/**
 * Document Operations
 */

/**
 * Open a document in the editor
 * @param {string} filePath - The path to the file to open
 * @returns {Promise<vscode.TextDocument>} - The opened document
 */
async function openDocument(filePath) {
  const uri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
  return document;
}

/**
 * Get the active text editor
 * @returns {vscode.TextEditor|null} - The active text editor or null if none
 */
function getActiveEditor() {
  return vscode.window.activeTextEditor;
}

/**
 * Wait for the language mode to be set
 * @param {number} timeout - The timeout in milliseconds
 * @returns {Promise<void>}
 */
async function waitForLanguageMode(timeout = 1000) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

/**
 * Close the active editor
 * @returns {Promise<void>}
 */
async function closeActiveEditor() {
  await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

/**
 * Apply an edit to a document
 * @param {vscode.TextEditor} editor - The editor to apply the edit to
 * @param {vscode.Range} range - The range to replace
 * @param {string} text - The text to replace with
 * @returns {Promise<boolean>} - Whether the edit was applied
 */
async function applyEdit(editor, range, text) {
  return await editor.edit(editBuilder => {
    editBuilder.replace(range, text);
  });
}

/**
 * Get the full range of a document
 * @param {vscode.TextDocument} document - The document to get the range for
 * @returns {vscode.Range} - The full range of the document
 */
function getDocumentRange(document) {
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
 * @param {vscode.TextDocument} document - The document to get sections for
 * @returns {Promise<Array<{name: string, level: number, range: vscode.Range, prefix: string}>>} - The sections
 */
async function getDocumentSections(document) {
  // Get document symbols
  const symbols = await vscode.commands.executeCommand(
    'vscode.executeDocumentSymbolProvider',
    document.uri
  );
  
  if (!symbols || symbols.length === 0) {
    return [];
  }
  
  // Process symbols to extract section information
  const sections = [];
  
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
 * @param {string} text - The document text
 * @param {RegExp} sectionRegex - The regex to match sections
 * @param {RegExp} numberedSectionRegex - The regex to match numbered sections
 * @param {RegExp} alternativeSectionRegex - The regex to match alternative sections
 * @returns {Array<{name: string, level: number, line: number, prefix: string}>} - The sections
 */
function findSections(text, sectionRegex, numberedSectionRegex, alternativeSectionRegex) {
  const sections = [];
  const lines = text.split('\n');
  
  // Find uppercase sections
  sectionRegex.lastIndex = 0;
  let match;
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
 * @param {string} command - The command to execute
 * @param {...any} args - The arguments to pass to the command
 * @returns {Promise<any>} - The result of the command
 */
async function executeCommand(command, ...args) {
  return await vscode.commands.executeCommand(command, ...args);
}

/**
 * Register a command
 * @param {vscode.ExtensionContext} context - The extension context
 * @param {string} command - The command to register
 * @param {Function} callback - The callback to execute when the command is invoked
 * @param {vscode.OutputChannel} outputChannel - The output channel to log to
 * @returns {vscode.Disposable} - The command registration
 */
function registerCommand(context, command, callback, outputChannel) {
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
 * @param {string} name - The name of the diagnostic collection
 * @returns {vscode.DiagnosticCollection} - The diagnostic collection
 */
function createDiagnosticCollection(name) {
  return vscode.languages.createDiagnosticCollection(name);
}

/**
 * Create a diagnostic
 * @param {vscode.Range} range - The range of the diagnostic
 * @param {string} message - The message of the diagnostic
 * @param {vscode.DiagnosticSeverity} severity - The severity of the diagnostic
 * @returns {vscode.Diagnostic} - The diagnostic
 */
function createDiagnostic(range, message, severity) {
  return new vscode.Diagnostic(range, message, severity);
}

/**
 * Set diagnostics for a document
 * @param {vscode.DiagnosticCollection} collection - The diagnostic collection
 * @param {vscode.Uri} uri - The URI of the document
 * @param {vscode.Diagnostic[]} diagnostics - The diagnostics to set
 */
function setDiagnostics(collection, uri, diagnostics) {
  collection.set(uri, diagnostics);
}

/**
 * UI Operations
 */

/**
 * Create an output channel
 * @param {string} name - The name of the output channel
 * @returns {vscode.OutputChannel} - The output channel
 */
function createOutputChannel(name) {
  return vscode.window.createOutputChannel(name);
}

/**
 * Show an information message
 * @param {string} message - The message to show
 * @returns {Promise<string|undefined>} - The selected item
 */
function showInformationMessage(message) {
  return sendNotification('FORMAT_SUCCESS');
}

/**
 * Show a warning message
 * @param {string} message - The message to show
 * @returns {Promise<string|undefined>} - The selected item
 */
function showWarningMessage(message) {
  return sendNotification('TOC_NO_SECTIONS');
}

/**
 * Show an error message
 * @param {string} message - The message to show
 * @returns {Promise<string|undefined>} - The selected item
 */
function showErrorMessage(message) {
  return sendNotification('FORMAT_ERROR', new Error(message));
}

/**
 * Wait for a condition to be true
 * @param {Function} condition - The condition to wait for
 * @param {number} timeout - The timeout in milliseconds
 * @param {number} interval - The interval to check the condition in milliseconds
 * @returns {Promise<boolean>} - Whether the condition was met
 */
async function waitForCondition(condition, timeout = 5000, interval = 100) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return false;
}

// Export all functions
module.exports = {
  // Document Operations
  openDocument,
  getActiveEditor,
  waitForLanguageMode,
  closeActiveEditor,
  applyEdit,
  getDocumentRange,
  
  // Section/Symbol Operations
  getDocumentSections,
  findSections,
  
  // Command Operations
  executeCommand,
  registerCommand,
  
  // Diagnostic Operations
  createDiagnosticCollection,
  createDiagnostic,
  setDiagnostics,
  
  // UI Operations
  createOutputChannel,
  showInformationMessage,
  showWarningMessage,
  showErrorMessage,

  waitForCondition
};