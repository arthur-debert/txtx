/**
 * Headless Backend
 * This backend implements core functionality without VSCode dependencies
 */

import {
  Backend,
  Position,
  Range,
  Selection,
  Uri,
  TextDocument,
  TextEditor,
  DiagnosticCollection
} from '../../types';

// Import features from separate files
import {
  HeadlessPosition,
  HeadlessRange,
  HeadlessSelection,
  HeadlessTextLine,
  HeadlessUri,
  createTextDocument,
  createTextEditor,
  applyTextEdit
} from './document-text';

import {
  HeadlessDocumentSymbolProvider,
  HeadlessDocumentLinkProvider,
  HeadlessFoldingRangeProvider,
  HeadlessCompletionItemProvider
} from './document-analysis';

import {
  HeadlessDiagnostic,
  HeadlessDiagnosticCollection,
  HeadlessOutputChannel
} from './diagnostics-notifications';

import {
  HeadlessWorkspace
} from './workspace-resource';

import {
  HeadlessDisposable,
  HeadlessCommands,
  HeadlessExtension,
  HeadlessExtensions
} from './command-extension';

import {
  HeadlessEventEmitter,
  HeadlessCancellationToken,
  HeadlessCancellationTokenSource
} from './event-handling';

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
  Range: any = HeadlessRange;
  
  // Selection class
  Selection: any = HeadlessSelection;
  
  // Uri class
  Uri: any = HeadlessUri;
  
  // Workspace APIs
  workspace: any;
  
  // Window APIs
  window: any;
  
  // Language APIs
  languages: any;
  
  // Command APIs
  commands: any;
  
  /**
   * Constructor
   * Initialize the backend
   */
  constructor() {
    // Initialize the backend
    // Initialize workspace APIs
    this.workspace = this._workspace;
    
    // Initialize window APIs
    this.window = {
      get activeTextEditor() { return this._activeEditor; },
      showTextDocument: async (document: TextDocument) => {
        if (!this._editors.has(document.uri.fsPath)) {
          const editor = createTextEditor(document);
          this._editors.set(document.uri.fsPath, editor);
        }
        this._activeEditor = this._editors.get(document.uri.fsPath);
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
      }
    };
    
    // Initialize language APIs
    this.languages = {
      registerDocumentSymbolProvider: (selector: any, provider: any) => {
        this._documentSymbolProvider = provider;
        return new HeadlessDisposable(() => { this._documentSymbolProvider = null; });
      },
      registerDocumentLinkProvider: (selector: any, provider: any) => {
        this._documentLinkProvider = provider;
        return new HeadlessDisposable(() => { this._documentLinkProvider = null; });
      },
      registerFoldingRangeProvider: (selector: any, provider: any) => {
        this._foldingRangeProvider = provider;
        return new HeadlessDisposable(() => { this._foldingRangeProvider = null; });
      },
      registerCompletionItemProvider: (selector: any, provider: any) => {
        this._completionItemProvider = provider;
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