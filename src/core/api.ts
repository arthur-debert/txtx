/**
 * VSCode API
 * This is the main entry point for the VSCode API
 * It exports a consistent API surface that matches the VSCode API used in the project
 * and directs calls to the appropriate backend based on configuration
 */

import { BackendManager } from './backend-manager.js';
import { VSCodeAPI } from './types.js';
import { fixNumbering as fixNumberingImpl, checkReferences as checkReferencesImpl } from './api-extensions.js';

/**
 * Create a proxy that forwards all property accesses and method calls to the current backend
 * This allows us to switch backends at runtime without changing the code that uses the API
 */
const api: VSCodeAPI = {
  // Position constructor
  get Position() { return BackendManager.current.Position; },
  
  // Range constructor
  get Range() { return BackendManager.current.Range; },
  
  // Selection constructor
  get Selection() { return BackendManager.current.Selection; },
  
  // Uri static methods
  get Uri() { return BackendManager.current.Uri; },
  
  // Workspace APIs
  workspace: {
    get openTextDocument() { return BackendManager.current.workspace.openTextDocument; },
    get applyEdit() { return BackendManager.current.workspace.applyEdit; },
    get getWorkspaceFolder() { return BackendManager.current.workspace.getWorkspaceFolder; },
  },
  
  // Window APIs
  window: {
    get activeTextEditor() { return BackendManager.current.window.activeTextEditor; },
    get showTextDocument() { return BackendManager.current.window.showTextDocument; },
    get createOutputChannel() { return BackendManager.current.window.createOutputChannel; },
    get showInformationMessage() { return BackendManager.current.window.showInformationMessage; },
    get showWarningMessage() { return BackendManager.current.window.showWarningMessage; },
    get showErrorMessage() { return BackendManager.current.window.showErrorMessage; },
    get createTextEditorDecorationType() { return BackendManager.current.window.createTextEditorDecorationType; },
  },
  
  // Language APIs
  languages: {
    get registerDocumentSymbolProvider() { return BackendManager.current.languages.registerDocumentSymbolProvider; },
    get registerDocumentLinkProvider() { return BackendManager.current.languages.registerDocumentLinkProvider; },
    get registerFoldingRangeProvider() { return BackendManager.current.languages.registerFoldingRangeProvider; },
    get registerCompletionItemProvider() { return BackendManager.current.languages.registerCompletionItemProvider; },
    get createDiagnosticCollection() { return BackendManager.current.languages.createDiagnosticCollection; },
  },
  
  // Command APIs
  commands: {
    get executeCommand() { return BackendManager.current.commands.executeCommand; },
    get registerCommand() { return BackendManager.current.commands.registerCommand; },
    get getCommands() { return BackendManager.current.commands.getCommands; },
  },
};

// Add additional API functions
const fixNumbering = fixNumberingImpl;
const checkReferences = checkReferencesImpl;

// Create a merged API object with both the VSCodeAPI and additional functions
const mergedApi = {
  ...api,
  fixNumbering,
  checkReferences
};

// Export the merged API
export default mergedApi;