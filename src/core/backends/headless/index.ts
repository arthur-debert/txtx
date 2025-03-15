/**
 * Headless Backend
 * This backend implements core functionality without VSCode dependencies
 */

import * as vscode from 'vscode';
import {
  Backend,
  Position,
  Range,
  Selection,
  Uri,
  TextDocument,
  TextEditor,
  DiagnosticCollection,
  Disposable,
  DocumentSymbolProvider,
  DocumentLinkProvider,
  FoldingRangeProvider,
  CompletionItemProvider,
  OutputChannel,
  WorkspaceEdit,
  TextEditorDecorationType,
  WorkspaceFolder
} from '../../types';

// Import features from separate files
import {
  HeadlessPosition,
  HeadlessRange,
  HeadlessSelection,
  HeadlessUri,
  createTextDocument,
  createTextEditor
} from './document-text';

import {
  HeadlessDocumentSymbolProvider,
  HeadlessDocumentLinkProvider,
  HeadlessFoldingRangeProvider,
  HeadlessCompletionItemProvider
} from './document-analysis';

import {
  HeadlessDiagnosticCollection,
  HeadlessOutputChannel
} from './diagnostics-notifications';

import {
  HeadlessWorkspace
} from './workspace-resource';

import {
  HeadlessDisposable,
  HeadlessCommands
} from './command-extension';

// Export format commands
export { formatCommands } from './format-commands';

// Export new format commands
export { formatDocumentCommand } from './format-document-command';
export { generateTOCCommand } from './generate-toc-command';
export { fullFormattingCommand } from './full-formatting-command';

// Export utility functions for backward compatibility
export { formatDocument } from './format-document-command';
export { fullFormatting } from './full-formatting-command';

// Export footnote commands
export { numberFootnotes } from './footnote-commands';

// Export reference commands
export { checkDocumentReferences } from './reference-commands';

// Export numbering commands
export { fixDocumentNumbering } from './numbering-commands';

/**
 * Headless Backend class
 * Implements the Backend interface with real functionality that doesn't depend on VSCode
 */
export class HeadlessBackend implements Backend {
  // Internal state
  private _documents: Map<string, TextDocument> = new Map();
  private _editors: Map<string, TextEditor> = new Map();
  private _activeEditor: TextEditor | undefined;
  private _commands: HeadlessCommands = new HeadlessCommands();
  private _workspace: HeadlessWorkspace = new HeadlessWorkspace();
  private _documentSymbolProvider: HeadlessDocumentSymbolProvider | null = null;
  private _documentLinkProvider: HeadlessDocumentLinkProvider | null = null;
  private _foldingRangeProvider: HeadlessFoldingRangeProvider | null = null;
  private _completionItemProvider: HeadlessCompletionItemProvider | null = null;
  
  // Position class
  Position: typeof HeadlessPosition = HeadlessPosition;
  
  // Range class
  Range: {
    new(startLine: number, startCharacter: number, endLine: number, endCharacter: number): Range;
    new(start: Position, end: Position): Range;
  } = HeadlessRange;
  
  // Selection class
  Selection: {
    new(anchorLine: number, anchorCharacter: number, activeLine: number, activeCharacter: number): Selection;
    new(anchor: Position, active: Position): Selection;
  } = HeadlessSelection;
  
  // Uri class
  Uri: {
    file: (path: string) => Uri;
    parse: (value: string) => Uri;
  } = HeadlessUri;
  
  // Workspace APIs
  workspace: {
    openTextDocument(uri: Uri): Promise<TextDocument>;
    openTextDocument(fileName: string): Promise<TextDocument>;
    applyEdit(edit: WorkspaceEdit): Promise<boolean>;
    getWorkspaceFolder(uri: Uri): WorkspaceFolder | undefined;
  };
  
  // Window APIs
  window: {
    activeTextEditor: TextEditor | undefined;
    showTextDocument(document: TextDocument): Promise<TextEditor>;
    createOutputChannel(name: string): OutputChannel;
    showInformationMessage(message: string): Promise<string | undefined>;
    showWarningMessage(message: string): Promise<string | undefined>;
    showErrorMessage(message: string): Promise<string | undefined>;
    createTextEditorDecorationType(options: vscode.DecorationRenderOptions): TextEditorDecorationType;
  };
  
  // Language APIs
  languages: {
    registerDocumentSymbolProvider(selector: vscode.DocumentSelector, provider: DocumentSymbolProvider): Disposable;
    registerDocumentLinkProvider(selector: vscode.DocumentSelector, provider: DocumentLinkProvider): Disposable;
    registerFoldingRangeProvider(selector: vscode.DocumentSelector, provider: FoldingRangeProvider): Disposable;
    registerCompletionItemProvider(selector: vscode.DocumentSelector, provider: CompletionItemProvider, ...triggerCharacters: string[]): Disposable;
    createDiagnosticCollection(name: string): DiagnosticCollection;
  };
  
  // Command APIs
  commands: HeadlessCommands;
  
  /**
   * Constructor
   * Initialize the backend
   */
  constructor() {
    // Initialize the backend
    // Initialize workspace APIs
    this.workspace = this._workspace;
    
    // Create window object with proper this binding
    const windowObj = {
      activeTextEditor: undefined as TextEditor | undefined,
      showTextDocument: async (document: TextDocument) => {
        if (!this._editors.has(document.uri.fsPath)) {
          const editor = createTextEditor(document);
          this._editors.set(document.uri.fsPath, editor);
        }
        this._activeEditor = this._editors.get(document.uri.fsPath);
        windowObj.activeTextEditor = this._activeEditor;
        return this._activeEditor as TextEditor;
      },
      createOutputChannel: (name: string) => new HeadlessOutputChannel(name),
      showInformationMessage: (message: string) => {
        console.log(`[INFO] ${message}`);
        return Promise.resolve(undefined);
      },
      showWarningMessage: (message: string) => {
        console.warn(`[WARNING] ${message}`);
        return Promise.resolve(undefined);
      },
      showErrorMessage: (message: string) => {
        console.error(`[ERROR] ${message}`);
        return Promise.resolve(undefined);
      },
      createTextEditorDecorationType: (options: vscode.DecorationRenderOptions) => {
        return {
          id: Math.random().toString(36).substring(2, 9),
          options: options
        };
      }
    };
    
    // Initialize window APIs
    this.window = windowObj;
    
    // Initialize language APIs
    this.languages = {
      registerDocumentSymbolProvider: (selector: vscode.DocumentSelector, provider: DocumentSymbolProvider) => {
        this._documentSymbolProvider = provider as HeadlessDocumentSymbolProvider;
        return new HeadlessDisposable(() => { this._documentSymbolProvider = null; });
      },
      registerDocumentLinkProvider: (selector: vscode.DocumentSelector, provider: DocumentLinkProvider) => {
        this._documentLinkProvider = provider as HeadlessDocumentLinkProvider;
        return new HeadlessDisposable(() => { this._documentLinkProvider = null; });
      },
      registerFoldingRangeProvider: (selector: vscode.DocumentSelector, provider: FoldingRangeProvider) => {
        this._foldingRangeProvider = provider as HeadlessFoldingRangeProvider;
        return new HeadlessDisposable(() => { this._foldingRangeProvider = null; });
      },
      registerCompletionItemProvider: (selector: vscode.DocumentSelector, provider: CompletionItemProvider) => {
        this._completionItemProvider = provider as HeadlessCompletionItemProvider;
        return new HeadlessDisposable(() => { this._completionItemProvider = null; });
      },
      createDiagnosticCollection: (name: string) => new HeadlessDiagnosticCollection(name)
    };
    
    // Initialize command APIs
    this.commands = this._commands;
  }
  
  /**
   * Set the content of a document
   * @param uri The URI of the document
   * @param content The content to set
   * @returns The document
   */
  setDocumentContent(uri: Uri, content: string): TextDocument {
    return createTextDocument(content, uri);
  }
}